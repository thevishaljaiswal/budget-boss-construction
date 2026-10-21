CREATE TYPE public.app_role AS ENUM ('accounts');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, role public.app_role NOT NULL, UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_own_roles ON public.user_roles FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
CREATE TABLE public.vendor_bank_masters (vendor_id text PRIMARY KEY, bank_details jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), verified_by uuid NOT NULL);
GRANT SELECT ON public.vendor_bank_masters TO authenticated; GRANT ALL ON public.vendor_bank_masters TO service_role;
ALTER TABLE public.vendor_bank_masters ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_bank_masters ON public.vendor_bank_masters FOR SELECT TO authenticated USING (true);
CREATE TABLE public.vendor_bank_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id text NOT NULL CHECK(length(vendor_id) BETWEEN 1 AND 100), vendor_name text NOT NULL CHECK(length(vendor_name) BETWEEN 1 AND 200), bank_details jsonb NOT NULL, previous_details jsonb NOT NULL DEFAULT '{}', cheque_path text NOT NULL, cheque_name text NOT NULL CHECK(length(cheque_name) BETWEEN 1 AND 255), reason text NOT NULL CHECK(length(reason) BETWEEN 1 AND 1000), requested_by uuid NOT NULL DEFAULT auth.uid(), requested_at timestamptz NOT NULL DEFAULT now(), status text NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Verified','Rejected')), reviewed_by uuid, reviewed_at timestamptz, review_notes text);
GRANT SELECT ON public.vendor_bank_requests TO authenticated; GRANT ALL ON public.vendor_bank_requests TO service_role;
ALTER TABLE public.vendor_bank_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_bank_requests ON public.vendor_bank_requests FOR SELECT TO authenticated USING(requested_by=auth.uid() OR public.has_role(auth.uid(),'accounts'));
CREATE UNIQUE INDEX one_pending_bank_change ON public.vendor_bank_requests(vendor_id) WHERE status='Pending';
CREATE FUNCTION public.submit_bank_change(p_vendor_id text,p_vendor_name text,p_details jsonb,p_previous jsonb,p_cheque_path text,p_cheque_name text,p_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result uuid; k text;
BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to submit a bank change'; END IF;
FOREACH k IN ARRAY ARRAY['bankName','accountHolderName','bankAccountNo','bankBranch','ifsc'] LOOP
IF p_details->>k IS NULL OR length(trim(p_details->>k)) NOT BETWEEN 1 AND 150 THEN RAISE EXCEPTION 'Bank details are incomplete'; END IF;
END LOOP;
IF (p_details->>'bankAccountNo') !~ '^[0-9]{6,34}$' OR (p_details->>'ifsc') !~ '^[A-Z]{4}0[A-Z0-9]{6}$' THEN RAISE EXCEPTION 'Invalid account number or IFSC'; END IF;
IF split_part(p_cheque_path,'/',1) <> auth.uid()::text OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='cancelled-cheques' AND name=p_cheque_path) THEN RAISE EXCEPTION 'Cancelled cheque is required'; END IF;
INSERT INTO public.vendor_bank_requests(vendor_id,vendor_name,bank_details,previous_details,cheque_path,cheque_name,reason) VALUES(p_vendor_id,p_vendor_name,p_details,COALESCE((SELECT bank_details FROM public.vendor_bank_masters WHERE vendor_id=p_vendor_id),p_previous),p_cheque_path,p_cheque_name,trim(p_reason)) RETURNING id INTO result;
RETURN result;
END $$;
CREATE FUNCTION public.review_bank_change(p_request_id uuid,p_approve boolean,p_notes text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.vendor_bank_requests;
BEGIN
IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'accounts') THEN RAISE EXCEPTION 'Only Accounts can verify bank changes'; END IF;
IF length(p_notes)>1000 OR (NOT p_approve AND length(trim(p_notes))=0) THEN RAISE EXCEPTION 'A rejection reason is required (maximum 1000 characters)'; END IF;
SELECT * INTO r FROM public.vendor_bank_requests WHERE id=p_request_id FOR UPDATE;
IF r.id IS NULL OR r.status <> 'Pending' THEN RAISE EXCEPTION 'Request is no longer pending'; END IF;
IF p_approve THEN
INSERT INTO public.vendor_bank_masters(vendor_id,bank_details,verified_by) VALUES(r.vendor_id,r.bank_details,auth.uid()) ON CONFLICT(vendor_id) DO UPDATE SET bank_details=EXCLUDED.bank_details,verified_by=EXCLUDED.verified_by,updated_at=now();
END IF;
UPDATE public.vendor_bank_requests SET status=CASE WHEN p_approve THEN 'Verified' ELSE 'Rejected' END,reviewed_by=auth.uid(),reviewed_at=now(),review_notes=trim(p_notes) WHERE id=r.id;
END $$;
REVOKE ALL ON FUNCTION public.submit_bank_change(text,text,jsonb,jsonb,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.submit_bank_change(text,text,jsonb,jsonb,text,text,text) TO authenticated;
REVOKE ALL ON FUNCTION public.review_bank_change(uuid,boolean,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.review_bank_change(uuid,boolean,text) TO authenticated;
CREATE POLICY upload_cancelled_cheque ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='cancelled-cheques' AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) IN ('pdf','jpg','jpeg','png'));
CREATE POLICY view_cancelled_cheque ON storage.objects FOR SELECT TO authenticated USING(bucket_id='cancelled-cheques' AND ((storage.foldername(name))[1]=auth.uid()::text OR public.has_role(auth.uid(),'accounts')));
CREATE POLICY remove_unsubmitted_cheque ON storage.objects FOR DELETE TO authenticated USING(bucket_id='cancelled-cheques' AND (storage.foldername(name))[1]=auth.uid()::text AND NOT EXISTS(SELECT 1 FROM public.vendor_bank_requests WHERE cheque_path=name));
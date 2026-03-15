import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, Send, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BillSettlement, BillSettlementLine } from '@/types';
import { formatCurrency } from '@/utils/formatters';

const emptyLine = (): BillSettlementLine => ({
  id: `BSL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  billNo: '',
  date: new Date().toISOString().split('T')[0],
  vendorName: '',
  description: '',
  quantity: 0,
  rate: 0,
  taxPercent: 18,
  taxAmount: 0,
  total: 0,
});

const BillSettlementPage = () => {
  const { vendors, projects, billSettlements, addBillSettlement } = useAppContext();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewSettlement, setViewSettlement] = useState<BillSettlement | null>(null);

  // Form state
  const [projectId, setProjectId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [lineItems, setLineItems] = useState<BillSettlementLine[]>([emptyLine(), emptyLine(), emptyLine()]);

  const selectedVendor = vendors.find(v => v.id === vendorId);

  const recalculateLine = (line: BillSettlementLine): BillSettlementLine => {
    const amount = line.quantity * line.rate;
    const taxAmount = (amount * line.taxPercent) / 100;
    return { ...line, taxAmount, total: amount + taxAmount };
  };

  const updateLineItem = (index: number, field: keyof BillSettlementLine, value: string | number) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (['quantity', 'rate', 'taxPercent'].includes(field as string)) {
        updated[index] = recalculateLine(updated[index]);
      }
      return updated;
    });
  };

  const addRow = () => setLineItems(prev => [...prev, emptyLine()]);

  const removeRow = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const totals = lineItems.reduce(
    (acc, line) => ({
      amount: acc.amount + line.quantity * line.rate,
      tax: acc.tax + line.taxAmount,
      grand: acc.grand + line.total,
    }),
    { amount: 0, tax: 0, grand: 0 }
  );

  const resetForm = () => {
    setProjectId('');
    setVendorId('');
    setBillDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setLineItems([emptyLine(), emptyLine(), emptyLine()]);
  };

  const handleSubmit = (asDraft: boolean) => {
    if (!projectId || !vendorId) {
      toast({ title: 'Error', description: 'Please select a project and vendor.', variant: 'destructive' });
      return;
    }
    const validLines = lineItems.filter(l => l.description && l.quantity > 0 && l.rate > 0);
    if (validLines.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one valid line item.', variant: 'destructive' });
      return;
    }

    const settlement: BillSettlement = {
      id: `BS-${Date.now()}`,
      billNumber: `BILL-${new Date().getFullYear()}-${String(billSettlements.length + 1).padStart(3, '0')}`,
      projectId,
      vendorId,
      billDate,
      submittedBy: 'Current User',
      remarks,
      status: asDraft ? 'Draft' : 'Submitted',
      totalAmount: totals.amount,
      totalTax: totals.tax,
      grandTotal: totals.grand,
      lineItems: validLines.map(l => ({
        ...l,
        vendorName: selectedVendor?.name || l.vendorName,
      })),
    };

    addBillSettlement(settlement);
    toast({
      title: asDraft ? 'Draft Saved' : 'Bill Submitted',
      description: `Bill ${settlement.billNumber} has been ${asDraft ? 'saved as draft' : 'submitted for approval'}.`,
    });
    resetForm();
    setIsFormOpen(false);
  };

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      Draft: 'bg-muted text-muted-foreground',
      Submitted: 'bg-blue-100 text-blue-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Settled: 'bg-emerald-100 text-emerald-800',
    };
    return map[status] || '';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill Settlement"
        description="Enter bill details in the editable grid and submit for settlement"
      />

      <div className="flex justify-end">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              New Bill Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enter Bill Details for Settlement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Header Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vendor</Label>
                  <Select value={vendorId} onValueChange={setVendorId}>
                    <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>
                      {vendors.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bill Date</Label>
                  <Input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} />
                </div>
                <div>
                  <Label>Remarks</Label>
                  <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional remarks" rows={1} />
                </div>
              </div>

              {/* Editable Grid */}
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-8">#</TableHead>
                      <TableHead className="min-w-[120px]">Bill No</TableHead>
                      <TableHead className="min-w-[130px]">Date</TableHead>
                      <TableHead className="min-w-[160px]">Vendor</TableHead>
                      <TableHead className="min-w-[200px]">Description</TableHead>
                      <TableHead className="min-w-[80px] text-right">Qty</TableHead>
                      <TableHead className="min-w-[100px] text-right">Rate</TableHead>
                      <TableHead className="min-w-[70px] text-right">Tax%</TableHead>
                      <TableHead className="min-w-[100px] text-right">Tax Amt</TableHead>
                      <TableHead className="min-w-[110px] text-right">Total</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((line, idx) => (
                      <TableRow key={line.id}>
                        <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                        <TableCell>
                          <Input
                            value={line.billNo}
                            onChange={e => updateLineItem(idx, 'billNo', e.target.value)}
                            placeholder="INV-XXX"
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={line.date}
                            onChange={e => updateLineItem(idx, 'date', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.vendorName || selectedVendor?.name || ''}
                            onChange={e => updateLineItem(idx, 'vendorName', e.target.value)}
                            placeholder="Vendor name"
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.description}
                            onChange={e => updateLineItem(idx, 'description', e.target.value)}
                            placeholder="Item description"
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.quantity || ''}
                            onChange={e => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm text-right"
                            min={0}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.rate || ''}
                            onChange={e => updateLineItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm text-right"
                            min={0}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.taxPercent}
                            onChange={e => updateLineItem(idx, 'taxPercent', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm text-right"
                            min={0}
                            max={100}
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatCurrency(line.taxAmount)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {formatCurrency(line.total)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(idx)}
                            disabled={lineItems.length <= 1}
                            className="h-7 w-7"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-semibold">Totals</TableCell>
                      <TableCell colSpan={2} className="text-right font-semibold">{formatCurrency(totals.amount)}</TableCell>
                      <TableCell className="text-right"></TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(totals.tax)}</TableCell>
                      <TableCell className="text-right font-bold text-base">{formatCurrency(totals.grand)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={addRow}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Row
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleSubmit(true)}>
                    <Save className="mr-2 h-4 w-4" /> Save as Draft
                  </Button>
                  <Button onClick={() => handleSubmit(false)}>
                    <Send className="mr-2 h-4 w-4" /> Submit for Settlement
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewSettlement} onOpenChange={() => setViewSettlement(null)}>
        <DialogContent className="max-w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill Details — {viewSettlement?.billNumber}</DialogTitle>
          </DialogHeader>
          {viewSettlement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Project:</span> {projects.find(p => p.id === viewSettlement.projectId)?.name}</div>
                <div><span className="text-muted-foreground">Vendor:</span> {vendors.find(v => v.id === viewSettlement.vendorId)?.name}</div>
                <div><span className="text-muted-foreground">Date:</span> {viewSettlement.billDate}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={statusColor(viewSettlement.status)}>{viewSettlement.status}</Badge></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Bill No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Tax%</TableHead>
                    <TableHead className="text-right">Tax Amt</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewSettlement.lineItems.map((l, i) => (
                    <TableRow key={l.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{l.billNo}</TableCell>
                      <TableCell>{l.date}</TableCell>
                      <TableCell>{l.vendorName}</TableCell>
                      <TableCell>{l.description}</TableCell>
                      <TableCell className="text-right">{l.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(l.rate)}</TableCell>
                      <TableCell className="text-right">{l.taxPercent}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(l.taxAmount)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(l.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5} className="text-right font-semibold">Totals</TableCell>
                    <TableCell colSpan={2} className="text-right font-semibold">{formatCurrency(viewSettlement.totalAmount)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(viewSettlement.totalTax)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(viewSettlement.grandTotal)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Existing Settlements List */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill Number</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billSettlements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No bill settlements yet. Click "New Bill Entry" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                billSettlements.map(bs => (
                  <TableRow key={bs.id}>
                    <TableCell className="font-medium">{bs.billNumber}</TableCell>
                    <TableCell>{projects.find(p => p.id === bs.projectId)?.name || bs.projectId}</TableCell>
                    <TableCell>{vendors.find(v => v.id === bs.vendorId)?.name || bs.vendorId}</TableCell>
                    <TableCell>{bs.billDate}</TableCell>
                    <TableCell>{bs.lineItems.length}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(bs.grandTotal)}</TableCell>
                    <TableCell><Badge className={statusColor(bs.status)}>{bs.status}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setViewSettlement(bs)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillSettlementPage;

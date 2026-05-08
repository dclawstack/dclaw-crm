"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCustomer } from "@/lib/api";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Awaited<ReturnType<typeof getCustomer>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCustomer(id)
      .then(setCustomer)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (!customer) return <div className="text-slate-500">Customer not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-slate-500">{customer.email}</p>
        </div>
        <Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Phone</CardTitle>
          </CardHeader>
          <CardContent>{customer.phone ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Company</CardTitle>
          </CardHeader>
          <CardContent>{customer.company ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Created</CardTitle>
          </CardHeader>
          <CardContent>{new Date(customer.created_at).toLocaleDateString()}</CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deals">
        <TabsList>
          <TabsTrigger value="deals">Deals ({customer.deals.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({customer.activities.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="deals" className="space-y-4">
          {customer.deals.length === 0 && <p className="text-slate-500">No deals yet.</p>}
          {customer.deals.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Stage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.deals.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <Link href={`/deals/${d.id}`} className="hover:underline">
                            {d.title}
                          </Link>
                        </TableCell>
                        <TableCell>${d.value.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{d.stage}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="activities" className="space-y-4">
          {customer.activities.length === 0 && <p className="text-slate-500">No activities yet.</p>}
          {customer.activities.length > 0 && (
            <div className="space-y-3">
              {customer.activities.map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex items-start gap-3 py-4">
                    <Badge variant="outline">{a.activity_type}</Badge>
                    <div className="flex-1">
                      <p className="text-sm">{a.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

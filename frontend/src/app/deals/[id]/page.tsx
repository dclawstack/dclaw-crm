"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDeal, updateDeal, listActivities, type Activity } from "@/lib/api";

const stages = [
  "prospecting",
  "qualification",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
];

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<Awaited<ReturnType<typeof getDeal>> | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [dealData, activitiesData] = await Promise.all([
      getDeal(id),
      listActivities(100, 0, undefined, id),
    ]);
    setDeal(dealData);
    setActivities(activitiesData.items);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleStageChange = async (stage: string) => {
    if (!id) return;
    await updateDeal(id, { stage });
    await load();
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (!deal) return <div className="text-slate-500">Deal not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{deal.title}</h1>
          <p className="text-slate-500">
            <Link href={`/customers/${deal.customer_id}`} className="hover:underline">
              {deal.customer.name}
            </Link>
          </p>
        </div>
        <Badge variant="outline">{deal.stage}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Value</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold">${deal.value.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Probability</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold">{deal.probability}%</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Expected Close</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold">
            {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : "—"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Move Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={deal.stage} onValueChange={handleStageChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activities.length === 0 && (
            <p className="p-6 text-slate-500">No activities for this deal.</p>
          )}
          {activities.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Badge variant="outline">{a.activity_type}</Badge>
                    </TableCell>
                    <TableCell>{a.description}</TableCell>
                    <TableCell>{new Date(a.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

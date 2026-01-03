import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Target, MessageSquare, ArrowDownUp, AlertCircle, FileText, Scale } from 'lucide-react';
import type { Playbook, BATNA } from '@/types/negotiation';

interface PlaybookPanelProps {
  playbook: Playbook;
  zopa: [number, number];
  batna: BATNA;
  memo: string;
  draftLoi: string;
}

export function PlaybookPanel({ playbook, zopa, batna, memo, draftLoi }: PlaybookPanelProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      {/* ZOPA Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Zone of Possible Agreement (ZOPA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Floor</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(zopa[0])}</p>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gradient-to-r from-green-500 via-primary to-amber-500 rounded-full" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ceiling</p>
              <p className="text-xl font-bold text-amber-600">{formatCurrency(zopa[1])}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Deals within this range are mutually beneficial. Target the lower end for value; higher end for certainty.
          </p>
        </CardContent>
      </Card>

      {/* BATNA */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Best Alternative (BATNA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Buyer's BATNA</p>
            <p className="text-sm text-muted-foreground">{batna.buyer}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Seller's BATNA</p>
            <p className="text-sm text-muted-foreground">{batna.seller}</p>
          </div>
        </CardContent>
      </Card>

      {/* Negotiation Playbook */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Negotiation Playbook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="anchor">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="h-5">1</Badge>
                  Opening Anchor
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {playbook.opening_anchor}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reactions">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="h-5">2</Badge>
                  Expected Reactions
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {playbook.expected_reactions.map((reaction, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {reaction}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="concessions">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="h-5">3</Badge>
                  Concessions Ladder
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {playbook.concessions_ladder.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowDownUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="talking-points">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="h-5">4</Badge>
                  Key Talking Points
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {playbook.key_talking_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Internal Memo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Internal Memo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 p-4 rounded-lg">
              {memo}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Draft LOI */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-2 bg-amber-50 dark:bg-amber-950/30 rounded-t-lg">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-5 h-5" />
            Draft LOI (Internal Only)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ScrollArea className="h-64">
            <pre className="text-xs whitespace-pre-wrap font-mono bg-muted/50 p-4 rounded-lg border border-dashed border-amber-300">
              {draftLoi}
            </pre>
          </ScrollArea>
          <p className="text-xs text-amber-600 mt-2 text-center">
            ⚠️ This document is for internal planning only and should not be shared externally.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

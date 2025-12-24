import { useState } from "react";
import { Book, Search, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const legalTerms = [
  { term: "FIR", full: "First Information Report", definition: "A written document prepared by police when they receive information about a cognizable offence. It's the first step to start criminal proceedings." },
  { term: "Legal Notice", full: "Legal Notice", definition: "A formal written communication sent to a party before filing a lawsuit, giving them a chance to resolve the dispute. Usually gives 15-30 days to respond." },
  { term: "Consumer Court", full: "Consumer Disputes Redressal Forum", definition: "A special court to resolve disputes between consumers and sellers/service providers. Handles complaints about defective goods, deficient services, unfair trade practices." },
  { term: "Hearing", full: "Court Hearing", definition: "A session where both parties present their arguments before a judge. You may need to attend multiple hearings during a case." },
  { term: "Bail", full: "Bail", definition: "Temporary release of an accused person from custody, usually on payment of a security amount. Can be anticipatory (before arrest) or regular (after arrest)." },
  { term: "Affidavit", full: "Affidavit", definition: "A written statement of facts that you swear/affirm to be true. Used as evidence in court proceedings. Must be signed in front of a notary." },
  { term: "Writ Petition", full: "Writ Petition", definition: "A formal written request to High Court or Supreme Court to protect your fundamental rights. Types include Habeas Corpus, Mandamus, Certiorari." },
  { term: "Injunction", full: "Injunction Order", definition: "A court order that prohibits someone from doing a specific act or requires them to do something. Used to prevent harm before final judgment." },
  { term: "Summons", full: "Court Summons", definition: "An official order from court requiring you to appear before it on a specific date. Ignoring summons can lead to legal consequences." },
  { term: "e-Daakhil", full: "Electronic Filing Portal", definition: "Online portal for filing consumer complaints. You can file complaints, pay fees, and track case status from home without visiting court." },
  { term: "NCH", full: "National Consumer Helpline", definition: "Government helpline (1800-11-4000) for consumer complaints. They try to resolve issues through mediation before you go to court." },
  { term: "Advocate", full: "Advocate/Lawyer", definition: "A person authorized to represent clients in court. In India, advocates are registered with State Bar Council and can practice in any court." },
  { term: "Vakalatnama", full: "Power of Attorney for Lawyer", definition: "A document authorizing a lawyer to represent you in court. You sign this when you hire an advocate for your case." },
  { term: "Pleading", full: "Legal Pleadings", definition: "Written statements filed by parties in court stating their claims or defenses. Includes plaint (complaint) and written statement (defense)." },
  { term: "Stay Order", full: "Stay Order", definition: "A court order temporarily stopping some action from taking place. Used to maintain status quo while the case is being heard." },
];

const LegalDictionary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const filteredTerms = legalTerms.filter(
    item => 
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.full.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-nyay-teal/10 flex items-center justify-center">
          <Book className="w-6 h-6 text-nyay-teal" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Legal Dictionary</h2>
          <p className="text-muted-foreground text-sm">Common legal terms explained in simple language</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search terms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredTerms.map((item) => (
          <Card
            key={item.term}
            className={`cursor-pointer transition-all hover:shadow-md ${
              expandedTerm === item.term ? 'border-nyay-teal' : ''
            }`}
            onClick={() => setExpandedTerm(expandedTerm === item.term ? null : item.term)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-nyay-indigo text-lg">{item.term}</span>
                  <span className="text-sm text-muted-foreground">({item.full})</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                  expandedTerm === item.term ? 'rotate-90' : ''
                }`} />
              </div>
              {expandedTerm === item.term && (
                <p className="text-sm text-foreground mt-3 leading-relaxed border-t pt-3">
                  {item.definition}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredTerms.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Terms Found</h3>
              <p className="text-muted-foreground text-sm">
                Try a different search term.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LegalDictionary;
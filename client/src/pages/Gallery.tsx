import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Crown, Image as ImageIcon, Search, Filter } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Gallery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContest, setSelectedContest] = useState<string>("all");
  
  const { data: contests } = trpc.contests.list.useQuery();
  const { data: media } = trpc.media.listPublic.useQuery({
    contestId: selectedContest === "all" ? undefined : parseInt(selectedContest)
  });
  const { data: candidates } = trpc.candidates.search.useQuery({
    contestId: selectedContest === "all" ? contests?.[0]?.id || 0 : parseInt(selectedContest),
    search: searchTerm || undefined,
  });

  const filteredMedia = media?.filter(m => {
    if (!searchTerm) return true;
    return m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           m.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Miss & Mister Dour</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Accueil
            </Link>
            <Link href="/gallery" className="text-sm font-medium text-primary">
              Galerie
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Tableau de Bord
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Galerie</h1>
          <p className="text-lg text-muted-foreground">
            Découvrez nos candidats et leurs portfolios
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un candidat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={selectedContest} onValueChange={setSelectedContest}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un concours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les concours</SelectItem>
                  {contests?.map((contest) => (
                    <SelectItem key={contest.id} value={contest.id.toString()}>
                      {contest.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Plus de filtres
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Grid */}
        {candidates && candidates.length > 0 ? (
          <div>
            <h2 className="mb-6 text-2xl font-bold">Candidats</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {candidates.map((candidate) => (
                <Card key={candidate.id} className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    {candidate.profilePhoto ? (
                      <img
                        src={candidate.profilePhoto}
                        alt={`${candidate.firstName} ${candidate.lastName}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-muted-foreground/20" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    
                    <Link href={`/candidates/${candidate.id}`} className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="secondary" size="sm" className="w-full">
                        Voir le profil
                      </Button>
                    </Link>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="mb-1 font-bold">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {candidate.category === 'miss' ? 'Miss' :
                       candidate.category === 'mister' ? 'Mister' :
                       candidate.category === 'teen_miss' ? 'Teen Miss' :
                       'Teen Mister'}
                    </p>
                    {candidate.city && (
                      <p className="text-xs text-muted-foreground">{candidate.city}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ImageIcon className="mb-4 h-16 w-16 text-muted-foreground/20" />
              <h3 className="mb-2 text-lg font-semibold">Aucun candidat trouvé</h3>
              <p className="text-sm text-muted-foreground">
                Essayez de modifier vos filtres de recherche
              </p>
            </CardContent>
          </Card>
        )}

        {/* Media Grid */}
        {filteredMedia && filteredMedia.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">Photos et Vidéos</h2>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredMedia.map((item) => (
                <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {item.type === 'photo' ? (
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.title || 'Media'}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  {item.title && (
                    <CardContent className="p-3">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Miss & Mister Dour. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

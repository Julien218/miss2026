import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Crown, Users, Calendar, Camera, Star, TrendingUp, Award, Bell } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: contests } = trpc.contests.list.useQuery();
  const { data: notifications } = trpc.notifications.list.useQuery({ limit: 5 });
  
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'owner';
  // L'édition officielle actuelle est 2026. Des doublons techniques historiques
  // peuvent rester en base, mais ne doivent jamais gonfler les indicateurs métier.
  const contests2026 = (contests || []).filter(contest => contest.year === 2026);
  const officialContest = contests2026.find(contest => contest.status === 'ongoing') ?? contests2026[0];
  const visibleContests = officialContest ? [officialContest] : [];
  const activeContests = visibleContests.filter(contest => contest.status !== 'completed');
  const unreadNotifications = notifications?.filter(n => n.isRead === 0) || [];

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Tableau de Bord</h1>
          <p className="text-muted-foreground">
            Bienvenue {user?.name}, voici un aperçu de votre activité
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concours Actifs</CardTitle>
              <Crown className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeContests.length}</div>
              <p className="text-xs text-muted-foreground">
                En cours ou en préparation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadNotifications.length}</div>
              <p className="text-xs text-muted-foreground">
                Non lues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                À venir ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activité</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">
                Par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Recent Contests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Concours Récents
              </CardTitle>
              <CardDescription>
                Les dernières éditions du concours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visibleContests.length > 0 ? (
                <div className="space-y-4">
                  {visibleContests.map((contest) => (
                    <div key={contest.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <h4 className="font-semibold">{contest.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Année {contest.year} • {contest.status}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/contests/${contest.id}`}>Voir</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Crown className="mx-auto mb-2 h-12 w-12 opacity-20" />
                  <p>Aucun concours pour le moment</p>
                  {isAdmin && (
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link href="/contests">Créer un Concours</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications Récentes
              </CardTitle>
              <CardDescription>
                Vos dernières notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                      <div className={`mt-0.5 h-2 w-2 rounded-full ${notification.isRead === 0 ? 'bg-primary' : 'bg-muted'}`} />
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.content}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/notifications">Voir Toutes les Notifications</Link>
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Bell className="mx-auto mb-2 h-12 w-12 opacity-20" />
                  <p>Aucune notification</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {isAdmin && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>
                Accès rapide aux fonctionnalités principales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                  <Link href="/contests">
                    <Crown className="h-6 w-6 text-primary" />
                    <span>Gérer les Concours</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                  <Link href="/candidates">
                    <Users className="h-6 w-6 text-primary" />
                    <span>Gérer les Candidats</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                  <Link href="/events">
                    <Calendar className="h-6 w-6 text-primary" />
                    <span>Gérer les Événements</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

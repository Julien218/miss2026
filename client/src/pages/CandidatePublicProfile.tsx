import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import CommentsSection from "@/components/CommentsSection";
import { AlertCircle, Check, Copy, Crown, ExternalLink, Facebook, Heart, Instagram, Loader2, MapPin, Share2, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { SEOHead } from "@/components/SEOHead";

function TikTokIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>; }
function LinkedInIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>; }

const CATEGORY_LABELS: Record<string,string> = { miss:"Miss", mister:"Mister", teen_miss:"Teen Miss", teen_mister:"Teen Mister" };
const FINGERPRINT_KEY = "mmd_public_vote_device_v1";

function normalizeUrl(value:string|null|undefined,platform:string){ if(!value)return null;if(value.startsWith("http"))return value;const pseudo=value.replace(/^@/,"");const bases:Record<string,string>={instagram:"https://instagram.com/",facebook:"https://facebook.com/",tiktok:"https://tiktok.com/@",linkedin:"https://linkedin.com/in/"};return (bases[platform]||"")+pseudo; }
function getDeviceFingerprint(){ let value=localStorage.getItem(FINGERPRINT_KEY);if(value&&value.length>=16)return value;value=`mmd_${crypto.randomUUID?.()||`${Date.now()}_${Math.random().toString(36).slice(2)}`}`;localStorage.setItem(FINGERPRINT_KEY,value);return value; }

export default function CandidatePublicProfile(){
  const params=useParams<{id:string}>();
  const candidateId=parseInt(params.id||"0",10);
  const [copied,setCopied]=useState(false);
  const [fingerprint,setFingerprint]=useState("");
  const [voteError,setVoteError]=useState("");
  const {data:candidate,isLoading,error}=trpc.candidateProfile.getPublicProfile.useQuery({candidateId},{enabled:!!candidateId&&!isNaN(candidateId)});
  useEffect(()=>{try{setFingerprint(getDeviceFingerprint())}catch{setFingerprint(`mmd_${Date.now()}_${Math.random().toString(36).slice(2)}`)}},[]);
  const contestId=candidate?.contestId||0;
  const canVoteQuery=trpc.votes.checkCanVote.useQuery({contestId,fingerprint},{enabled:!!contestId&&fingerprint.length>=16,retry:false});
  const voteMutation=trpc.votes.cast.useMutation({onSuccess:()=>{setVoteError("");void canVoteQuery.refetch()},onError:(err)=>setVoteError(err.message)});

  if(isLoading)return <div className="mmd-public-page mmd-profile-state"><Loader2 className="animate-spin"/><p>Chargement du profil…</p></div>;
  if(error||!candidate)return <div className="mmd-public-page mmd-profile-state"><AlertCircle/><h1>Profil introuvable</h1><p>Ce profil n’existe pas ou n’est pas encore publié.</p><Link href="/candidates" className="mmd-primary-button">Retour aux candidats</Link></div>;

  const instagramUrl=normalizeUrl(candidate.instagram,"instagram"),facebookUrl=normalizeUrl(candidate.facebook,"facebook"),tiktokUrl=normalizeUrl(candidate.tiktok,"tiktok"),linkedinUrl=normalizeUrl(candidate.linkedin,"linkedin");
  const shareText=`Découvrez ${candidate.firstName} ${candidate.lastName} — ${CATEGORY_LABELS[candidate.category]||candidate.category} · Miss & Mister Dour 2027`;
  const copyLink=async()=>{await navigator.clipboard?.writeText(window.location.href).catch(()=>undefined);setCopied(true);setTimeout(()=>setCopied(false),2500)};
  const share=async()=>{if(navigator.share){await navigator.share({title:shareText,text:shareText,url:window.location.href}).catch(()=>undefined);return;}await copyLink();};
  const alreadyVoted=canVoteQuery.data?.hasVoted===true;

  return <div className="mmd-public-page mmd-profile-page">
    <SEOHead title={`${candidate.firstName} ${candidate.lastName} — Miss & Mister Dour 2027`} description={`Découvrez le profil de ${candidate.firstName} ${candidate.lastName}, ${CATEGORY_LABELS[candidate.category]||candidate.category} de Miss & Mister Dour.`} url={`https://missetmisterdour.be/candidat/${candidate.id}`} image={candidate.profilePhoto||undefined} type="website" tags={[`${candidate.firstName} ${candidate.lastName}`,"Miss Mister Dour 2027",CATEGORY_LABELS[candidate.category]||""]}/>
    <section className="mmd-profile-hero"><div className="mmd-container mmd-profile-hero-grid">
      <div className="mmd-profile-photo-wrap">{candidate.profilePhoto?<img src={candidate.profilePhoto} alt={`${candidate.firstName} ${candidate.lastName}`} className="mmd-profile-photo"/>:<div className="mmd-profile-photo mmd-profile-photo-fallback"><Crown/></div>}<span>{CATEGORY_LABELS[candidate.category]||candidate.category}</span></div>
      <div className="mmd-profile-intro"><div className="mmd-public-kicker"><span>PROFIL OFFICIEL</span><i/>ÉDITION 2027</div><h1>{candidate.firstName}<br/><em>{candidate.lastName}</em></h1>{candidate.city&&<p className="mmd-profile-city"><MapPin/>{candidate.city}</p>}<div className="mmd-profile-stats"><div><strong>{candidate.voteCount||0}</strong><span>Votes</span></div><div><strong>{candidate.shareCount||0}</strong><span>Partages</span></div></div><div className="mmd-profile-actions">
        {alreadyVoted?<span className="mmd-vote-success"><Check/>Vote déjà enregistré pour cette édition</span>:<button type="button" disabled={voteMutation.isPending||!contestId||fingerprint.length<16} onClick={()=>voteMutation.mutate({contestId,candidateId:candidate.id,fingerprint})} className="mmd-primary-button">{voteMutation.isPending?<Loader2 className="animate-spin"/>:<Heart/>}Voter pour {candidate.firstName}</button>}<button type="button" onClick={share} className="mmd-secondary-button"><Share2/>Partager</button></div>{voteError&&<p className="mmd-form-submit-error" role="alert">{voteError}</p>}
      </div>
    </div></section>
    <section className="mmd-section"><div className="mmd-container mmd-profile-content-grid"><article className="mmd-profile-story"><span className="mmd-overline">SON HISTOIRE</span><h2>À propos de <em>{candidate.firstName}.</em></h2><p>{candidate.bio||"La présentation de ce profil sera complétée prochainement."}</p></article><aside className="mmd-profile-social"><span className="mmd-overline">RÉSEAUX</span><h2>Suivre le profil</h2><div className="mmd-profile-social-links">{instagramUrl&&<a href={instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram/>Instagram<ExternalLink/></a>}{facebookUrl&&<a href={facebookUrl} target="_blank" rel="noopener noreferrer"><Facebook/>Facebook<ExternalLink/></a>}{tiktokUrl&&<a href={tiktokUrl} target="_blank" rel="noopener noreferrer"><TikTokIcon/>TikTok<ExternalLink/></a>}{linkedinUrl&&<a href={linkedinUrl} target="_blank" rel="noopener noreferrer"><LinkedInIcon/>LinkedIn<ExternalLink/></a>}{!instagramUrl&&!facebookUrl&&!tiktokUrl&&!linkedinUrl&&<p>Aucun réseau public renseigné.</p>}</div></aside></div></section>
    <section className="mmd-section mmd-profile-share-section"><div className="mmd-container mmd-profile-share-card"><div><Star/><span className="mmd-overline">FAIRE CONNAÎTRE LE PROFIL</span><h2>Partagez <em>son parcours.</em></h2><p>Un lien direct permet à vos proches de découvrir ce profil officiel.</p></div><div className="mmd-profile-share-actions"><button type="button" onClick={share}><Share2/>Partager</button><button type="button" onClick={copyLink}>{copied?<Check/>:<Copy/>}{copied?"Lien copié":"Copier le lien"}</button></div></div></section>
    <section className="mmd-section"><div className="mmd-container mmd-profile-comments"><CommentsSection candidateId={candidate.id} candidateName={`${candidate.firstName} ${candidate.lastName}`}/></div></section>
  </div>;
}

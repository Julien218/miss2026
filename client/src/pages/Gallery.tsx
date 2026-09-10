import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Search, Sparkles, Users, X, ZoomIn } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";

type EventFilter = "all" | "portrait" | "event" | "backstage" | "performance" | "other";
type CandidateFilter = "all" | "miss" | "mister";
const EVENT_LABELS: Record<EventFilter,string> = { all:"Tout", portrait:"Portraits", event:"Shooting", backstage:"Backstage", performance:"Performances", other:"Autres" };

export default function Gallery(){
  const [eventFilter,setEventFilter]=useState<EventFilter>("all");
  const [candidateFilter,setCandidateFilter]=useState<CandidateFilter>("all");
  const [lightboxIndex,setLightboxIndex]=useState<number|null>(null);
  const [visibleCount,setVisibleCount]=useState(40);
  const [subscribeEmail,setSubscribeEmail]=useState("");
  const [subscribeName,setSubscribeName]=useState("");
  const subscribeMutation=trpc.photos.subscribe.useMutation();
  const {data:photos,isLoading}=trpc.photos.listPublic.useQuery(eventFilter==="all"?undefined:{category:eventFilter});
  const {data:candidates}=trpc.candidateProfile.listApproved.useQuery();

  const filtered=useMemo(()=>{
    if(!photos)return [];
    return candidateFilter==="all"?photos:photos.filter(photo=>photo.candidateCategory===candidateFilter);
  },[photos,candidateFilter]);
  const current=lightboxIndex!==null?filtered[lightboxIndex]:null;
  const close=useCallback(()=>{setLightboxIndex(null);document.body.style.overflow=""},[]);
  const next=useCallback(()=>setLightboxIndex(i=>i===null?0:(i+1)%Math.max(filtered.length,1)),[filtered.length]);
  const prev=useCallback(()=>setLightboxIndex(i=>i===null?0:(i-1+Math.max(filtered.length,1))%Math.max(filtered.length,1)),[filtered.length]);
  useEffect(()=>{if(lightboxIndex===null)return;document.body.style.overflow="hidden";const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")close();if(event.key==="ArrowRight")next();if(event.key==="ArrowLeft")prev()};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[lightboxIndex,close,next,prev]);

  return <div className="mmd-public-page">
    <SEOHead title="Galerie & backstage — Miss & Mister Dour 2027" description="Portraits, shootings, coulisses et moments forts de Miss & Mister Dour." url="https://missetmisterdour.be/gallery" />
    <section className="mmd-public-hero"><div className="mmd-container">
      <div className="mmd-public-kicker"><span>05</span><i/>BACKSTAGE & GALERIE</div>
      <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="mmd-public-logo-mark"/>
      <h1>Dans la lumière. Et <em>derrière la scène.</em></h1>
      <p>Portraits officiels, préparation, shootings, performances et instants spontanés : la mémoire visuelle de l’aventure.</p>
    </div></section>

    <section className="mmd-section"><div className="mmd-container">
      <div className="mmd-gallery-toolbar">
        <div className="mmd-gallery-filter-group"><Search className="h-4 w-4"/>{(Object.keys(EVENT_LABELS) as EventFilter[]).map(key=><button key={key} className={eventFilter===key?"is-active":""} onClick={()=>{setEventFilter(key);setVisibleCount(40)}}>{EVENT_LABELS[key]}</button>)}</div>
        <div className="mmd-gallery-filter-group"><Users className="h-4 w-4"/>{(["all","miss","mister"] as CandidateFilter[]).map(key=><button key={key} className={candidateFilter===key?"is-active":""} onClick={()=>setCandidateFilter(key)}>{key==="all"?"Tous":key==="miss"?"Miss":"Mister"}</button>)}</div>
      </div>
      <div className="mmd-gallery-count"><strong>{filtered.length}</strong> média{filtered.length>1?"s":""} · {candidates?.length??0} profils publiés</div>

      {isLoading?<div className="mmd-gallery-grid">{Array.from({length:12}).map((_,i)=><div key={i} className="mmd-gallery-skeleton"/>)}</div>:filtered.length===0?<div className="mmd-empty-editorial"><ImageIcon/><h2>Galerie en préparation</h2><p>Aucun média ne correspond encore à ce filtre.</p></div>:<>
        <div className="mmd-gallery-grid">{filtered.slice(0,visibleCount).map((photo,index)=><button type="button" key={photo.id} className={`mmd-gallery-item ${photo.category==="portrait"?"is-portrait":""}`} onClick={()=>setLightboxIndex(index)}>
          <img src={photo.thumbnail||photo.url} alt={photo.title&&photo.title!=="title"?photo.title:photo.candidateName||"Miss & Mister Dour"} loading="lazy"/>
          <div className="mmd-gallery-shade"/><span className="mmd-gallery-tag">{EVENT_LABELS[(photo.category as EventFilter)]||photo.category}</span><ZoomIn className="mmd-gallery-zoom"/>
          {(photo.candidateName||photo.title)&&<div className="mmd-gallery-caption"><strong>{photo.candidateName||photo.title}</strong>{photo.candidateCategory&&<small>{photo.candidateCategory}</small>}</div>}
        </button>)}</div>
        {filtered.length>visibleCount&&<div className="mmd-load-more"><button onClick={()=>setVisibleCount(v=>v+40)}>Voir plus · {filtered.length-visibleCount}</button></div>}
      </>}
    </div></section>

    <section className="mmd-newsletter-strip"><div className="mmd-container"><div><Sparkles/><span>Galerie vivante</span><h2>Recevez les nouveaux contenus.</h2></div><form onSubmit={async e=>{e.preventDefault();if(!subscribeEmail.trim())return;await subscribeMutation.mutateAsync({email:subscribeEmail,name:subscribeName||undefined});setSubscribeEmail("");setSubscribeName("")}}>
      <input type="text" value={subscribeName} onChange={e=>setSubscribeName(e.target.value)} placeholder="Votre nom (optionnel)"/>
      <input type="email" required value={subscribeEmail} onChange={e=>setSubscribeEmail(e.target.value)} placeholder="Votre email"/>
      <button disabled={subscribeMutation.isPending}>{subscribeMutation.isPending?"Inscription…":"S’abonner"}</button>
    </form>{subscribeMutation.isSuccess&&<p className="mmd-form-success">Merci, inscription enregistrée.</p>}</div></section>

    <section className="mmd-final-cta mmd-final-cta--compact"><div className="mmd-container mmd-final-content"><span className="mmd-final-eyebrow">ÉDITION 2027</span><h2>Vivez l’histoire <em>de l’intérieur.</em></h2><p>Les candidatures sont ouvertes.</p><div className="mmd-final-actions"><Link href="/inscription-candidat" className="mmd-final-dark-button">Candidater</Link><Link href="/candidates" className="mmd-final-outline-button">Voir les profils</Link></div></div></section>

    {current&&<div className="mmd-lightbox" onClick={close} role="dialog" aria-modal="true"><button className="mmd-lightbox-close" onClick={close}><X/></button>{filtered.length>1&&<button className="mmd-lightbox-prev" onClick={e=>{e.stopPropagation();prev()}}><ChevronLeft/></button>}<figure onClick={e=>e.stopPropagation()}><img src={current.url} alt={current.title||current.candidateName||"Photo"}/><figcaption><strong>{current.candidateName||current.title}</strong>{current.candidateId&&<Link href={`/candidat/${current.candidateId}`}>Voir le profil</Link>}</figcaption></figure>{filtered.length>1&&<button className="mmd-lightbox-next" onClick={e=>{e.stopPropagation();next()}}><ChevronRight/></button>}</div>}
  </div>;
}

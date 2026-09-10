import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { BarometerOrb } from "../components/BarometerOrb";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";

export function Ranking() {
  const [selectedCategory,setSelectedCategory]=useState<"all"|"miss"|"mister">("all");
  const {data:candidates,refetch}=trpc.candidateProfile.listApproved.useQuery();

  useEffect(()=>{const interval=setInterval(()=>refetch(),30000);return()=>clearInterval(interval)},[refetch]);

  const rankedCandidates=useMemo(()=>{
    const base=candidates??[];
    const filtered=selectedCategory==="all"?base:base.filter(c=>c.category===selectedCategory);
    return [...filtered].sort((a,b)=>(b.voteCount??0)-(a.voteCount??0)).slice(0,10);
  },[candidates,selectedCategory]);

  return <div className="mmd-public-page">
    <SEOHead title="Classement — Miss & Mister Dour" description="Suivez le classement public des profils actuellement publiés de Miss & Mister Dour." url="https://missetmisterdour.be/ranking" />
    <section className="mmd-public-hero">
      <div className="mmd-container">
        <div className="mmd-public-kicker"><span>LIVE</span><i/>CLASSEMENT</div>
        <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="mmd-public-logo-mark"/>
        <h1>Suivez l’évolution de <em>l’édition.</em></h1>
        <p>Un aperçu public de l’engagement autour des profils validés. Le classement se met à jour automatiquement.</p>
      </div>
    </section>
    <section className="mmd-section"><div className="mmd-container">
      <div className="mmd-ranking-controls">
        <BarometerOrb size="md"/>
        <div className="mmd-category-filters">
          {(["all","miss","mister"] as const).map(cat=><button key={cat} className={selectedCategory===cat?"is-active":""} onClick={()=>setSelectedCategory(cat)}>{cat==="all"?"Tous":cat==="miss"?"Miss":"Mister"}</button>)}
        </div>
      </div>
      <div className="mmd-ranking-list"><AnimatePresence mode="popLayout">
        {rankedCandidates.map((candidate,index)=>{
          const rank=index+1;
          return <motion.article key={candidate.id} layout initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{delay:index*.035}}>
            <Link href={`/candidat/${candidate.id}`} className={`mmd-ranking-row ${rank<=3?"is-podium":""}`}>
              <div className="mmd-rank-number">{rank===1?<Crown/>:rank===2?<Medal/>:<span>{String(rank).padStart(2,"0")}</span>}</div>
              <div className="mmd-rank-photo">{candidate.profilePhoto?<img src={candidate.profilePhoto} alt={`${candidate.firstName} ${candidate.lastName}`}/>:<span>{candidate.firstName?.[0]}{candidate.lastName?.[0]}</span>}</div>
              <div className="mmd-rank-person"><small>{candidate.category} · {candidate.city||"Dour"}</small><h2>{candidate.firstName} <em>{candidate.lastName}</em></h2></div>
              <div className="mmd-rank-metrics"><div><strong>{candidate.voteCount??0}</strong><span>Votes</span></div><div><strong>{candidate.shareCount??0}</strong><span>Partages</span></div></div>
            </Link>
          </motion.article>
        })}
      </AnimatePresence></div>
      {rankedCandidates.length===0&&<div className="mmd-empty-editorial"><Trophy/><h2>Classement en attente</h2><p>Les données apparaîtront ici dès que des profils validés seront publiés.</p></div>}
    </div></section>
  </div>;
}

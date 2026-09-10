import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Crown, Eye, Medal, Trophy, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { BarometerOrb } from "../components/BarometerOrb";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";

interface RankedCandidate {
  id:number; firstName:string; lastName:string; category:string; profilePhoto:string|null;
  city:string; voteCount:number; shareCount:number; shareClicksToday:number; profileViewsToday:number;
}

export function Ranking() {
  const [selectedCategory,setSelectedCategory]=useState<"all"|"miss"|"mister">("all");
  const [rankedCandidates,setRankedCandidates]=useState<RankedCandidate[]>([]);
  const {data:candidates,refetch}=trpc.candidates.listByContest.useQuery({contestId:1});
  const {data:analyticsData}=trpc.analytics.getBulkAnalytics.useQuery(
    {candidateIds:candidates?.map(c=>c.id)||[]},{enabled:!!candidates&&candidates.length>0}
  );

  useEffect(()=>{const interval=setInterval(()=>refetch(),30000);return()=>clearInterval(interval)},[refetch]);
  useEffect(()=>{
    if(!candidates||!analyticsData)return;
    const merged=candidates.map(candidate=>{
      const analytics=analyticsData.find(a=>a.candidateId===candidate.id);
      return {id:candidate.id,firstName:candidate.firstName,lastName:candidate.lastName,category:candidate.category,
        profilePhoto:candidate.profilePhoto,city:candidate.city||"Dour",voteCount:candidate.voteCount,
        shareCount:candidate.shareCount,shareClicksToday:analytics?.shareClicksToday||0,profileViewsToday:analytics?.profileViewsToday||0};
    });
    const filtered=selectedCategory==="all"?merged:merged.filter(c=>c.category===selectedCategory);
    setRankedCandidates(filtered.sort((a,b)=>b.voteCount-a.voteCount).slice(0,10));
  },[candidates,analyticsData,selectedCategory]);

  return <div className="mmd-public-page">
    <SEOHead title="Classement — Miss & Mister Dour 2027" description="Suivez le classement public de Miss & Mister Dour 2027." url="https://missetmisterdour.be/ranking" />
    <section className="mmd-public-hero">
      <div className="mmd-container">
        <div className="mmd-public-kicker"><span>LIVE</span><i/>CLASSEMENT</div>
        <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="mmd-public-logo-mark"/>
        <h1>Suivez l’évolution de <em>l’édition.</em></h1>
        <p>Un aperçu vivant de l’engagement autour des profils. Les données se mettent à jour automatiquement.</p>
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
              <div className="mmd-rank-person"><small>{candidate.category} · {candidate.city}</small><h2>{candidate.firstName} <em>{candidate.lastName}</em></h2></div>
              <div className="mmd-rank-metrics"><div><strong>{candidate.voteCount}</strong><span>Votes</span></div><div><strong>{candidate.shareCount}</strong><span>Partages</span></div></div>
              <div className="mmd-rank-live">
                {candidate.shareClicksToday>0&&<span><TrendingUp/>+{candidate.shareClicksToday}</span>}
                {candidate.profileViewsToday>0&&<span><Eye/>+{candidate.profileViewsToday}</span>}
              </div>
            </Link>
          </motion.article>
        })}
      </AnimatePresence></div>
      {rankedCandidates.length===0&&<div className="mmd-empty-editorial"><Trophy/><h2>Classement en attente</h2><p>Les données apparaîtront ici dès que l’édition sera active.</p></div>}
    </div></section>
  </div>;
}

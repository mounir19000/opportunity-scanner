import React from 'react';
import { ArrowRight, Radar, Search, X } from 'lucide-react';

export default function HeroSearch({ search, setSearch, total, sourceCount }) {
  return (
    <section className="sch-hero">
      <div className="sch-container sch-hero-inner">
        <div className="sch-hero-copy">
          <span className="sch-overline"><span className="sch-overline-mark" /> ONE PLACE TO EXPLORE</span>
          <h1>Find your next<br /><em>opportunity.</em></h1>
          <p>Browse internships, research programmes, and schools collected from {sourceCount} sources. Confirm dates and eligibility on the original listing.</p>
          <div className="sch-search">
            <Search size={21} />
            <input aria-label="Search opportunities" type="search" placeholder="Search roles, hosts, locations..." value={search} onChange={(event) => setSearch(event.target.value)} />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><X size={16} /></button>}
            <button type="button" className="sch-search-submit" onClick={() => document.getElementById('source-results')?.scrollIntoView({ behavior: 'smooth' })}>Explore <ArrowRight size={16} /></button>
          </div>
        </div>
        <div className="sch-hero-art" aria-hidden="true">
          <div className="sch-orbit orbit-one" />
          <div className="sch-orbit orbit-two" />
          <div className="sch-orbit-center"><Radar size={76} strokeWidth={1.4} /></div>
          <span className="sch-orbit-pill p1">INTERNSHIPS</span>
          <span className="sch-orbit-pill p2">RESEARCH</span>
          <span className="sch-orbit-pill p3">SCHOOLS</span>
          <div className="sch-hero-count"><strong>{total.toLocaleString()}</strong><span>LEADS</span></div>
        </div>
      </div>
    </section>
  );
}

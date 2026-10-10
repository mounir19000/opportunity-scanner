import React from 'react';

export default function InteriorHero({ eyebrow, title, accent, description, metric, metricLabel }) {
  return (
    <section className="sch-interior-hero">
      <div className="sch-container sch-interior-hero-inner">
        <div className="sch-interior-hero-copy">
          <span className="sch-overline"><span className="sch-overline-mark" />{eyebrow}</span>
          <h1>{title}<br /><em>{accent}</em></h1>
          <p>{description}</p>
        </div>
        <div className="sch-interior-hero-metric" aria-label={`${metric} ${metricLabel}`}>
          <strong>{metric}</strong>
          <span>{metricLabel}</span>
        </div>
      </div>
    </section>
  );
}

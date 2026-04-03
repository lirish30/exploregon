type SectionHeadingProps = {
  title: string
  kicker?: string
  lede?: string
}

export const SectionHeading = ({ title, kicker, lede }: SectionHeadingProps) => {
  return (
    <header className="section-heading">
      {kicker ? <p className="section-heading-kicker">{kicker}</p> : null}
      <h2 className="section-heading-title">{title}</h2>
      {lede ? <p className="section-heading-lede">{lede}</p> : null}
    </header>
  )
}

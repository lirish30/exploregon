type FaqItem = {
  question: string
  answer: string
}

type FaqAccordionProps = {
  items: FaqItem[]
}

export const FaqAccordion = ({ items }: FaqAccordionProps) => {
  if (!items.length) {
    return null
  }

  return (
    <section>
      <div className="faq-accordion">
        {items.map((item, index) => (
          <details key={`${item.question}-${index}`} className="faq-item">
            <summary className="faq-question">{item.question}</summary>
            <p className="faq-answer">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

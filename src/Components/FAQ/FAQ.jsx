import React, { useState } from "react";
import { ArrowUpRight, MessageCircleQuestion, Plus } from "lucide-react";
import "./FAQ.css";

const questions = [
  {
    question: "Can I customize my Sri Lanka itinerary?",
    answer: "Absolutely. Tell us your travel dates, interests, budget, and preferred pace, and we’ll shape a private journey around you.",
  },
  {
    question: "What is included in a tour package?",
    answer: "Inclusions depend on the journey you choose. We’ll clearly confirm your transport, stays, guides, activities, and any entrance tickets before you book.",
  },
  {
    question: "Do you arrange airport pickup and transfers?",
    answer: "Yes. We can arrange airport pickup, drop-off, and comfortable private transport throughout your trip.",
  },
  {
    question: "Can you help with hotels and activities?",
    answer: "Yes. We can recommend stays and plan experiences such as cultural visits, wildlife safaris, scenic rail journeys, and beach time.",
  },
  {
    question: "How do I request a quote?",
    answer: "Use our Plan My Trip form and share your dates, group size, and wish list. We’ll follow up with a tailored proposal.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="faq-shell">
        <div className="faq-main">
          <header className="faq-heading">
            <span className="faq-eyebrow">Good to know</span>
            <h2 id="faq-title">Frequently asked questions</h2>
            <p>Helpful answers before your Sri Lankan adventure begins.</p>
          </header>

          <div className="faq-list">
            {questions.map(({ question, answer }, index) => {
              const isOpen = openIndex === index;
              const panelId = `faq-answer-${index}`;

              return (
                <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={question}>
                  <h3>
                    <button
                      type="button"
                      className="faq-question"
                      id={`faq-question-${index}`}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    >
                      <span>{question}</span>
                      <Plus size={19} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </h3>
                  <div
                    className="faq-answer"
                    id={panelId}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    aria-hidden={!isOpen}
                  >
                    <div><p>{answer}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="faq-contact" aria-labelledby="faq-contact-title">
          <span className="faq-contact__icon" aria-hidden="true"><MessageCircleQuestion size={31} strokeWidth={1.8} /></span>
          <div>
            <h3 id="faq-contact-title">Still have questions?</h3>
            <p>Tell our local team what you have in mind. We’ll help you plan the right Sri Lanka journey.</p>
          </div>
          <a className="faq-contact__button" href="/quote">Ask Menty Tours <ArrowUpRight size={18} aria-hidden="true" /></a>
        </aside>
      </div>
    </section>
  );
}

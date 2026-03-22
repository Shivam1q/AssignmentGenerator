import { Section } from "@/types";
import QuestionItem from "./QuestionItem";

interface Props {
  section: Section;
}

export default function QuestionSection({ section }: Props) {
  return (
    <div className="mb-8">
      <h3 className="text-center font-bold text-[16px] mb-4 text-[#2B2B2B]">
        {section.title}
      </h3>
      
      <div className="mb-4">
        <p className="font-bold text-[#2B2B2B] text-[15px] leading-relaxed">{section.type}</p>
        <p className="text-[13px] italic text-[#7B7B7B] mt-1">{section.instruction}</p>
      </div>

      <div className="space-y-1">
        {section.questions.map((q) => (
          <QuestionItem key={q.number} question={q} />
        ))}
      </div>
    </div>
  );
}


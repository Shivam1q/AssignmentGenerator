import { AnswerKeyItem } from "@/types";

interface Props {
  answerKey: AnswerKeyItem[];
}

export default function AnswerKey({ answerKey }: Props) {
  if (!answerKey || answerKey.length === 0) return null;

  return (
    <div style={{ pageBreakBefore: 'always' }} className="mt-16 pt-8 border-t border-[#2B2B2B] text-[#2B2B2B]">
      <h3 className="font-bold text-[18px] mb-4">
        Answer Key:
      </h3>
      
      <div className="space-y-2">
        {answerKey.map((item) => (
          <p key={item.number} className="text-[14px] leading-relaxed">
            <span className="font-semibold mr-1">{item.number}.</span>
            {item.answer}
          </p>
        ))}
      </div>
    </div>
  );
}


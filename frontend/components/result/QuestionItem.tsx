import { Question } from "@/types";

interface Props {
  question: Question;
}

export default function QuestionItem({ question }: Props) {
  return (
    <div className="text-[14px] leading-relaxed mb-4 text-[#2B2B2B] flex items-start gap-2">
      <div className="flex-shrink-0 font-medium">{question.number}.</div>
      <div className="flex-1 flex flex-col md:flex-row md:justify-between md:items-start md:gap-4">
        <div className="flex-1">
          <div className="font-medium text-[14px]">{question.text}</div>
          {question.options && question.options.length > 0 && (
            <div className="mt-3 space-y-2 pl-2">
              {question.options.map((opt, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[13.5px] text-gray-700">
                  <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center md:flex-col md:items-end md:gap-1 gap-2 flex-shrink-0 mt-3 md:mt-0 opacity-90">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
            {question.difficulty}
          </span>
          <span className="text-[11px] font-bold text-[#2B2B2B] bg-gray-100 px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
            {question.marks} Marks
          </span>
        </div>
      </div>
    </div>
  );
}

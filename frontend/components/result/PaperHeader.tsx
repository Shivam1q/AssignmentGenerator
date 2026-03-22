interface Props {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
}

export default function PaperHeader({ schoolName, subject, className, timeAllowed, maximumMarks }: Props) {
  return (
    <div className="mb-8">
      <div className="text-center mb-6 text-[#2B2B2B]">
        <h1 className="text-[22px] font-bold mb-1">{schoolName}</h1>
        <p className="text-[16px]">Subject: {subject}</p>
        <p className="text-[16px]">Class: {className}</p>
      </div>

      <div className="flex justify-between items-center text-[14px] font-semibold border-b border-[#2B2B2B] pb-3 text-[#2B2B2B]">
        <span>Time Allowed: {timeAllowed}</span>
        <span>Maximum Marks: {maximumMarks}</span>
      </div>
    </div>
  );
}


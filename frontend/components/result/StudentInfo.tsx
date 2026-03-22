interface Props {
  generalInstruction: string;
}

export default function StudentInfo({ generalInstruction }: Props) {
  return (
    <div className="mb-8 text-[#2B2B2B] text-[14px]">
      {generalInstruction && (
        <p className="mb-4">{generalInstruction}</p>
      )}

      <div className="space-y-3 font-semibold mt-6">
        <p className="flex items-end">
          Name: <span className="inline-block w-48 border-b border-black ml-2"></span>
        </p>
        <p className="flex items-end">
          Roll Number: <span className="inline-block w-40 border-b border-black ml-2"></span>
        </p>
        <p className="flex items-end">
          Class: <span className="inline-block w-16 border-b border-black ml-2 mr-4"></span>
          Section: <span className="inline-block w-16 border-b border-black ml-2"></span>
        </p>
      </div>
    </div>
  );
}


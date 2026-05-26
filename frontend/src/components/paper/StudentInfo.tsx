export function StudentInfo() {
  const dots = ' '.repeat(48);
  return (
    <div className="mt-5 space-y-1.5 text-sm">
      <div>Name: <span className="border-b border-gray-400 inline-block min-w-[260px]">{dots}</span></div>
      <div>Roll Number: <span className="border-b border-gray-400 inline-block min-w-[220px]">{dots}</span></div>
      <div>Class, 5th Section: <span className="border-b border-gray-400 inline-block min-w-[180px]">{dots}</span></div>
    </div>
  );
}

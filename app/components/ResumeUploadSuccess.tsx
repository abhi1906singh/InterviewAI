type ResumeUploadSuccessProps = {
  onReUpload: () => void;
};

export default function ResumeUploadSuccess({
  onReUpload,
}: ResumeUploadSuccessProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-5">
      <div>
        <h3 className="font-semibold text-green-700">
          ✅ Resume uploaded successfully
        </h3>

        <p className="mt-1 text-sm text-green-600">
          Review your parsed resume below or upload a different one.
        </p>
      </div>

      <button
        onClick={onReUpload}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Replace Resume
      </button>
    </div>
  );
}
interface BookingStepNameProps {
  name: string;
  onChange: (name: string) => void;
  onNext: () => void;
}

export function BookingStepName({ name, onChange, onNext }: BookingStepNameProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink">Server name</label>
        <input
          type="text"
          placeholder="e.g. Q3 Crisis Comms"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-line px-3 py-2 text-sm bg-paper text-ink"
        />
      </div>
      <button
        onClick={onNext}
        disabled={!name.trim()}
        className="w-full rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

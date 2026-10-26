const InputErrorComponent = ({ error }: { error?: string }) =>
  error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null;

export default InputErrorComponent;

export default function SmartImage({
  alt,
  decoding = 'async',
  fetchPriority,
  loading = 'lazy',
  ...props
}) {
  const resolvedFetchPriority = fetchPriority ?? (loading === 'eager' ? 'high' : 'auto');

  return (
    <img
      alt={alt}
      decoding={decoding}
      fetchPriority={resolvedFetchPriority}
      loading={loading}
      {...props}
    />
  );
}
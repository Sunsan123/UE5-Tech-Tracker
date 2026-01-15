import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useRef } from "react";

interface InfiniteScrollListProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
}

const InfiniteScrollList = ({
  isLoading,
  hasMore,
  onLoadMore,
  children
}: InfiniteScrollListProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        onLoadMore();
      }
    });

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <Stack spacing={2}>
      {children}
      <Box ref={sentinelRef} display="flex" justifyContent="center" py={2}>
        {isLoading && <CircularProgress size={28} />}
        {!hasMore && !isLoading && (
          <Typography variant="body2" color="text.secondary">
            已加载全部更新
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default InfiniteScrollList;

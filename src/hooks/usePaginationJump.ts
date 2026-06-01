import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
} from "react";
import {
  parsePageJumpDraft,
  syncPageJumpDraft,
} from "@/utils/paginationJump";

export const usePaginationJump = (
  pageIndex: number,
  goToPage: (page: number) => void,
) => {
  const [pageJumpDraft, setPageJumpDraft] = useState(() =>
    syncPageJumpDraft(pageIndex),
  );

  useEffect(() => {
    setPageJumpDraft(syncPageJumpDraft(pageIndex));
  }, [pageIndex]);

  const commitPageJump = useCallback(() => {
    const targetPage = parsePageJumpDraft(pageJumpDraft);

    if (targetPage === null) {
      setPageJumpDraft(syncPageJumpDraft(pageIndex));
      return;
    }

    goToPage(targetPage);
  }, [goToPage, pageIndex, pageJumpDraft]);

  const handlePageJumpKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      commitPageJump();
    },
    [commitPageJump],
  );

  return {
    pageJumpDraft,
    setPageJumpDraft,
    commitPageJump,
    handlePageJumpKeyDown,
  };
};

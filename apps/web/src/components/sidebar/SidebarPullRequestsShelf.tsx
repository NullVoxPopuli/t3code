import type { ScopedThreadRef, ThreadPullRequestLink } from "@t3tools/contracts";
import { scopeThreadRef } from "@t3tools/client-runtime/environment";
import type { MouseEvent } from "react";

import { useOpenPrLink } from "../../lib/openPullRequestLink";
import { cn } from "../../lib/utils";
import type { SidebarThreadSummary } from "../../types";
import { PullRequestGlyph } from "../pullRequest/pullRequestIcons";
import { resolvePullRequestState } from "../pullRequest/pullRequestPresentation";
import { CollapsibleSectionHeader } from "../ui/collapsible-section-header";

export interface SidebarOpenPullRequest {
  readonly key: string;
  readonly link: ThreadPullRequestLink;
  readonly thread: Pick<SidebarThreadSummary, "environmentId" | "id" | "title">;
}

/**
 * Open pull requests linked to the sidebar's unsettled threads. A click opens the pull request
 * in its thread's right panel; a modified click opens the host.
 */
export function SidebarPullRequestsShelf(props: {
  pullRequests: readonly SidebarOpenPullRequest[];
  expanded: boolean;
  onToggle: () => void;
  onThreadActivate: (threadRef: ScopedThreadRef) => void;
}) {
  const openPrLink = useOpenPrLink();
  const { onThreadActivate } = props;
  if (props.pullRequests.length === 0) return null;
  const handleOpen = (event: MouseEvent<HTMLAnchorElement>, entry: SidebarOpenPullRequest) => {
    const threadRef = scopeThreadRef(entry.thread.environmentId, entry.thread.id);
    if (openPrLink(event, entry.link.url, threadRef)) onThreadActivate(threadRef);
  };
  return (
    <div className="mx-0.5 flex flex-col gap-px" data-testid="sidebar-pull-requests-shelf">
      <CollapsibleSectionHeader
        onClick={props.onToggle}
        expanded={props.expanded}
        data-testid="sidebar-pull-requests-shelf-toggle"
      >
        {props.expanded ? "Pull requests" : `Pull requests (${props.pullRequests.length})`}
      </CollapsibleSectionHeader>
      {props.expanded ? (
        <ul className="flex flex-col gap-px">
          {props.pullRequests.map((entry) => {
            const { link } = entry;
            const presentation =
              link.snapshot === null
                ? null
                : resolvePullRequestState({
                    state: link.snapshot.state,
                    isDraft: link.snapshot.isDraft,
                  });
            const Icon = presentation?.Icon ?? PullRequestGlyph.pullRequest;
            return (
              <li key={entry.key}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${link.repository}#${link.number} · ${entry.thread.title}`}
                  onClick={(event) => handleOpen(event, entry)}
                  className="flex h-8 min-w-0 items-center gap-2 rounded-md px-2.5 text-sm text-sidebar-muted-foreground hover:bg-sidebar-row-hover hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <Icon
                    aria-label={presentation?.label}
                    className={cn(
                      "size-3.5 shrink-0",
                      presentation?.toneClassName ?? "stroke-muted-foreground",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {link.snapshot?.title ?? link.repository}
                  </span>
                  <span className="shrink-0 font-mono text-2xs tabular-nums opacity-70">
                    #{link.number}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

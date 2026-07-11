import React, { useRef, useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Skeleton,
  IconButton,
} from "@mui/material";
import { Warning, ChevronRight } from "@mui/icons-material";
import { SvgIconComponent } from "@mui/icons-material";
import { Violation } from "../ViolationCard/ViolationCard";
import ViewAlertPopup from "../ViewAlertPopup/ViewAlertPopup";

// 3 tiles fill the container edge-to-edge (no partial 4th tile peeking in at rest).
const VISIBLE_TILES = 3;
const TILE_GAP = 14;
const TILE_BASIS = `calc((100% - ${(VISIBLE_TILES - 1) * TILE_GAP}px) / ${VISIBLE_TILES})`;

interface RecentViolationsProps {
  readonly tooltipMessage: string;
  readonly label: string;
  readonly violations: readonly Violation[];
  readonly loading?: boolean;
  readonly imageKey?: string;
  readonly onDownload?: (url: string, violation: Violation) => void;
  /** Icon shown in every tile's thumbnail — defaults to a generic warning icon. */
  readonly icon?: SvgIconComponent;
}

export default function RecentViolations(
  props: Readonly<RecentViolationsProps>,
) {
  const {
    tooltipMessage,
    label,
    violations,
    loading = false,
    imageKey = "imageUrl",
    onDownload,
    icon: TileIcon = Warning,
  } = props;

  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleOpen = (violation: Violation) => {
    setSelectedViolation(violation);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedViolation(null);
  };

  const scrollNext = () => {
    // Tile width is a percentage of the container, so scroll by a measured
    // one-tile amount rather than a hardcoded pixel value.
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth / VISIBLE_TILES, behavior: "smooth" });
  };

  /* ---------------- Render Helpers ---------------- */

  const renderSkeletons = () => (
    <Box sx={{ display: "flex", gap: `${TILE_GAP}px`, overflow: "hidden" }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Box key={`skeleton-${index + 1}`} sx={{ flex: `0 0 ${TILE_BASIS}` }}>
          <Skeleton variant="rectangular" height={130} sx={{ borderRadius: "10px 10px 0 0" }} />
          <Skeleton width="70%" sx={{ mt: 1 }} />
          <Skeleton width="50%" />
        </Box>
      ))}
    </Box>
  );

  const renderEmptyState = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        p: 4,
        textAlign: "center",
        color: "#808080",
      }}
    >
      <Typography variant="h6" fontWeight={500}>
        🚫 No Recent Violations Found
      </Typography>
    </Box>
  );

  const canScroll = violations.length > VISIBLE_TILES;

  const renderViolations = () => (
    <Box
      sx={{
        position: "relative",
        "&:hover .rv-next-btn": { opacity: 1, pointerEvents: "auto" },
      }}
    >
      {/* No reserved right padding here — 3 tiles must span the full width with
          zero dead space, otherwise sub-pixel rounding can let a sliver of the
          4th tile peek through. The arrow button floats on top of tile 3, but
          stays hidden until hover so it never obscures the tile at rest. */}
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: `${TILE_GAP}px`,
          overflowX: "auto",
          scrollBehavior: "smooth",
          pb: "2px",
          "&::-webkit-scrollbar": { height: 0 },
        }}
      >
        {violations.map((violation, index) => {
          const title =
            violation.violation || violation.incident || violation.usage || "Violation";
          const cameraId = violation.cameraId ? String(violation.cameraId) : "";
          const meta = [violation.zone, cameraId].filter(Boolean).join(" · ");
          const imageUrl = violation[imageKey];
          const hasImage =
            typeof imageUrl === "string" &&
            imageUrl.length > 0 &&
            !failedImages.has(index);

          return (
            <Box
              key={`violation-${index + 1}`}
              onClick={() => handleOpen(violation)}
              sx={{
                flex: `0 0 ${TILE_BASIS}`,
                border: "1px solid #E5E7EB",
                borderRadius: "11px",
                overflow: "hidden",
                bgcolor: "#fff",
                cursor: "pointer",
                transition: "box-shadow .12s ease, transform .12s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,.10)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  height: 130,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#374151",
                  overflow: "hidden",
                }}
              >
                {hasImage ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={String(title)}
                    onError={() =>
                      setFailedImages((prev) => new Set(prev).add(index))
                    }
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <TileIcon sx={{ fontSize: 32, color: "rgba(255,255,255,.4)" }} />
                )}
              </Box>
              <Box sx={{ p: "11px 12px 13px 12px" }}>
                <Typography
                  sx={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "#111827",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {title}
                </Typography>
                {meta && (
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "#6B7280",
                      fontWeight: 500,
                      mt: "4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {meta}
                  </Typography>
                )}
                {violation.time && (
                  <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF", mt: "2px" }}>
                    {violation.time}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {canScroll && (
        <IconButton
          className="rv-next-btn"
          onClick={scrollNext}
          sx={{
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1,
            width: 32,
            height: 32,
            border: "1px solid #E5E7EB",
            bgcolor: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,.10)",
            color: "#6B7280",
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity .15s ease",
            "&:hover": { color: "#2563EB" },
          }}
        >
          <ChevronRight fontSize="small" />
        </IconButton>
      )}
    </Box>
  );

  const renderContent = () => {
    if (loading) return renderSkeletons();
    if (violations.length === 0) return renderEmptyState();
    return renderViolations();
  };

  /* ---------------- JSX ---------------- */

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <CardContent sx={{ p: 3, flex: 1 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2.5,
          }}
        >
          <Warning sx={{ fontSize: 20, color: "#f44336" }} />
          <Typography variant="h6" fontWeight={600} color="#1c2025">
            {label}
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ minHeight: 200 }}>{renderContent()}</Box>
      </CardContent>

      {/* Popup */}
      {selectedViolation && (
        <ViewAlertPopup
          open={open}
          handleClose={handleClose}
          details={selectedViolation}
          imageKey={imageKey}
          onDownload={(url) => {
            if (onDownload) {
              onDownload(url, selectedViolation);
            }
          }}
        />
      )}
    </Card>
  );
}

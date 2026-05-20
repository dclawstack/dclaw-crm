import asyncio
import logging
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


class EventBus:
    """In-process pub/sub for broadcasting real-time events to SSE subscribers.

    Each connected client gets its own asyncio.Queue. Publishing pushes to all
    queues concurrently. Subscribers are cleaned up when the SSE stream closes.

    Not suitable for multi-process deployments — swap the backing store to Redis
    Pub/Sub when you scale horizontally.
    """

    def __init__(self) -> None:
        self._queues: list[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=64)
        self._queues.append(q)
        logger.debug("SSE client connected  (total=%d)", len(self._queues))
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        try:
            self._queues.remove(q)
        except ValueError:
            pass
        logger.debug("SSE client disconnected (total=%d)", len(self._queues))

    async def publish(self, event: dict[str, Any]) -> None:
        if not self._queues:
            return
        # put_nowait so a slow/stale client doesn't block other clients
        dropped = 0
        for q in list(self._queues):
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                dropped += 1
        if dropped:
            logger.warning("SSE: dropped event for %d slow subscriber(s)", dropped)

    @property
    def subscriber_count(self) -> int:
        return len(self._queues)


# Module-level singleton — imported by both the SSE router and deal mutation handlers
event_bus = EventBus()

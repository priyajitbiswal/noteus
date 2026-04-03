"""
Yjs WebSocket sync protocol helpers.
Implements the y-protocols sync + awareness message encoding/decoding.
"""

# ── Message type constants ──────────────────────────────────────────────────
MSG_SYNC = 0
MSG_AWARENESS = 1

# Sync steps
SYNC_STEP1 = 0   # client/server sends its state vector
SYNC_STEP2 = 1   # responder sends missing updates
SYNC_UPDATE = 2  # new update from either side


# ── Variable-length integer encoding (lib0 compatible) ─────────────────────

def encode_var_int(n: int) -> bytes:
    buf = bytearray()
    while True:
        bits = n & 0x7F
        n >>= 7
        if n:
            bits |= 0x80
        buf.append(bits)
        if not n:
            break
    return bytes(buf)


def decode_var_int(data: bytes | bytearray, offset: int = 0):
    result, shift = 0, 0
    while True:
        if offset >= len(data):
            break
        b = data[offset]; offset += 1
        result |= (b & 0x7F) << shift
        if not (b & 0x80):
            break
        shift += 7
    return result, offset


def encode_var_bytes(data: bytes) -> bytes:
    return encode_var_int(len(data)) + data


def decode_var_bytes(data: bytes | bytearray, offset: int = 0):
    length, offset = decode_var_int(data, offset)
    return bytes(data[offset: offset + length]), offset + length


# ── Message builders ────────────────────────────────────────────────────────

def make_sync_step1(state_vector: bytes) -> bytes:
    return encode_var_int(MSG_SYNC) + encode_var_int(SYNC_STEP1) + encode_var_bytes(state_vector)


def make_sync_step2(update: bytes) -> bytes:
    return encode_var_int(MSG_SYNC) + encode_var_int(SYNC_STEP2) + encode_var_bytes(update)


def make_update_msg(update: bytes) -> bytes:
    return encode_var_int(MSG_SYNC) + encode_var_int(SYNC_UPDATE) + encode_var_bytes(update)


def make_awareness_msg(awareness: bytes) -> bytes:
    return encode_var_int(MSG_AWARENESS) + encode_var_bytes(awareness)


# ── Message parser ──────────────────────────────────────────────────────────

def parse_messages(data: bytes):
    """Generator that parses multiple concatenated y-websocket messages inside a single frame."""
    offset = 0
    length = len(data)
    
    while offset < length:
        msg_type, offset = decode_var_int(data, offset)
        if msg_type == MSG_SYNC:
            step, offset = decode_var_int(data, offset)
            content, offset = decode_var_bytes(data, offset)
            yield {"type": "sync", "step": step, "content": content}
            
        elif msg_type == MSG_AWARENESS:
            content, offset = decode_var_bytes(data, offset)
            yield {"type": "awareness", "content": content}
            
        else:
            # If we hit an unknown type or auth packet, we stop decoding this frame.
            break

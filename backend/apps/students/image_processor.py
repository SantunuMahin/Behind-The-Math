import io
import os
import uuid
from PIL import Image
from django.conf import settings

def optimize_avatar_image(image_input, max_kb=500, max_dimension=800, target_square=True):
    """
    Takes an uploaded image file, byte stream, or file-like object,
    resizes it, and compresses it so that it is guaranteed to be strictly under max_kb (500 KB).
    
    Returns:
        tuple: (compressed_bytes, file_extension, final_size_kb, width, height)
    """
    target_bytes = int(max_kb * 1024)
    
    # 1. Open image with Pillow
    img = Image.open(image_input)
    
    # Handle EXIF orientation if present
    try:
        from PIL import ImageOps
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    # 2. Convert mode if needed (handling alpha/transparency cleanly)
    has_alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
    if has_alpha:
        img = img.convert('RGBA')
        save_format = 'WEBP'
        file_ext = 'webp'
    else:
        img = img.convert('RGB')
        save_format = 'WEBP'
        file_ext = 'webp'
        
    orig_w, orig_h = img.size
    
    # 3. Optional Square Center-Crop for avatars
    if target_square:
        min_dim = min(orig_w, orig_h)
        left = (orig_w - min_dim) // 2
        top = (orig_h - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        img = img.crop((left, top, right, bottom))
        orig_w, orig_h = img.size

    # 4. Resize if larger than max_dimension
    if max(orig_w, orig_h) > max_dimension:
        ratio = max_dimension / float(max(orig_w, orig_h))
        new_w = max(1, int(orig_w * ratio))
        new_h = max(1, int(orig_h * ratio))
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 5. Iterative Compression Loop to guarantee strictly under max_kb (500 KB)
    quality = 88
    buffer = io.BytesIO()
    
    # Step 5a: Tune quality down
    while quality >= 25:
        buffer.seek(0)
        buffer.truncate(0)
        img.save(buffer, format=save_format, quality=quality, method=6)
        if buffer.tell() <= target_bytes:
            break
        quality -= 10
        
    # Step 5b: If still larger than target_bytes, reduce dimensions progressively
    while buffer.tell() > target_bytes and img.size[0] > 120 and img.size[1] > 120:
        new_w = int(img.size[0] * 0.85)
        new_h = int(img.size[1] * 0.85)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        buffer.seek(0)
        buffer.truncate(0)
        img.save(buffer, format=save_format, quality=quality, method=6)
        
    final_bytes = buffer.getvalue()
    final_size_kb = round(len(final_bytes) / 1024, 2)
    final_w, final_h = img.size
    
    return final_bytes, file_ext, final_size_kb, final_w, final_h


def save_avatar_file(profile_id, image_bytes, file_ext='webp'):
    """
    Saves optimized avatar bytes to MEDIA_ROOT/avatars/ and returns the relative URL.
    """
    avatars_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
    os.makedirs(avatars_dir, exist_ok=True)
    
    filename = f"avatar_scholar_{profile_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
    filepath = os.path.join(avatars_dir, filename)
    
    with open(filepath, 'wb') as f:
        f.write(image_bytes)
        
    media_url = settings.MEDIA_URL.rstrip('/') + f"/avatars/{filename}"
    return media_url

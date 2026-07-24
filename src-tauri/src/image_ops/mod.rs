use windows_sys::Win32::Foundation::POINT;
use windows_sys::Win32::Graphics::Gdi::{GetDC, GetPixel, ReleaseDC};
use windows_sys::Win32::UI::WindowsAndMessaging::GetCursorPos;

pub fn sample_color_at_cursor() -> Result<String, String> {
    unsafe {
        let mut pt: POINT = std::mem::zeroed();
        if GetCursorPos(&mut pt) == 0 {
            return Err("Failed to get cursor position".to_string());
        }

        let hdc = GetDC(std::ptr::null_mut());
        if hdc.is_null() {
            return Err("Failed to get display device context".to_string());
        }

        let color = GetPixel(hdc, pt.x, pt.y);
        ReleaseDC(std::ptr::null_mut(), hdc);

        if color == 0xFFFFFFFF {
            return Err("Failed to sample pixel color".to_string());
        }

        let r = (color & 0x000000FF) as u8;
        let g = ((color & 0x0000FF00) >> 8) as u8;
        let b = ((color & 0x00FF0000) >> 16) as u8;

        Ok(format!("#{:02X}{:02X}{:02X}", r, g, b))
    }
}

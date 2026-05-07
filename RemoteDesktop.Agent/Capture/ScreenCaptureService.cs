using SixLabors.ImageSharp.Formats;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text;

namespace RemoteDesktop.Agent.Capture;

public class ScreenCaptureService
{
    [DllImport("user32.dll")]
    private static extern IntPtr GetDesktopWindow();

    [DllImport("user32.dll")]
    private static extern IntPtr GetDC(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);

    [DllImport("gdi32.dll")]
    private static extern IntPtr CreateCompatibleDC(IntPtr hDC);

    [DllImport("gdi32.dll")]
    private static extern IntPtr CreateCompatibleBitmap(IntPtr hDC, int width, int height);

    [DllImport("gdi32.dll")]
    private static extern IntPtr SelectObject(IntPtr hDC, IntPtr hObject);

    [DllImport("gdi32.dll")]
    private static extern bool BitBlt(IntPtr hDC, int x, int y, int width, int height,
        IntPtr hSrcDC, int xSrc, int ySrc, int dwRop);

    [DllImport("gdi32.dll")]
    private static extern bool DeleteObject(IntPtr hObject);

    [DllImport("gdi32.dll")]
    private static extern bool DeleteDC(IntPtr hDC);

    private const int SRCCOPY = 0x00CC0020;

    private readonly int _screenWidth;
    private readonly int _screenHeight;

    public ScreenCaptureService()
    {
        _screenWidth = System.Windows.Forms.Screen.PrimaryScreen?.Bounds.Width ?? 1920;
        _screenHeight = System.Windows.Forms.Screen.PrimaryScreen?.Bounds.Height ?? 1080;
    }

    public byte[] CaptureScreen(int quality = 50)
    {
        IntPtr desktopWindow = GetDesktopWindow();
        IntPtr desktopDC = GetDC(desktopWindow);
        IntPtr memoryDC = CreateCompatibleDC(desktopDC);
        IntPtr bitmap = CreateCompatibleBitmap(desktopDC, _screenWidth, _screenHeight);
        IntPtr oldBitmap = SelectObject(memoryDC, bitmap);

        BitBlt(memoryDC, 0, 0, _screenWidth, _screenHeight, desktopDC, 0, 0, SRCCOPY);
        SelectObject(memoryDC, oldBitmap);

        using var bmp = Image.FromHbitmap(bitmap);
        using var ms = new MemoryStream();

        var encoderParams = new EncoderParameters(1);
        encoderParams.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, (long)quality);
        var jpegCodec = GetJpegCodec();
        bmp.Save(ms, jpegCodec, encoderParams);

        DeleteObject(bitmap);
        DeleteDC(memoryDC);
        ReleaseDC(desktopWindow, desktopDC);

        return ms.ToArray();
    }

    private static ImageCodecInfo GetJpegCodec()
    {
        return ImageCodecInfo.GetImageEncoders()
            .First(c => c.FormatID == ImageFormat.Jpeg.Guid);
    }
}
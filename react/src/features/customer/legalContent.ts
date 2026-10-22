export type LegalTab = "terms" | "privacy";
export const content: Record<LegalTab, { title: string; paragraphs: string[] }> = {
  terms: {
    title: "İstifadəçi şərtləri",
    paragraphs: [
      "Zeyvo-nun bu versiyası xidmətləri və mütəxəssisləri göstərən lokal demodur. Burada edilən rezervasiyalar real xidmət təminatçısına göndərilmir.",
      "Demo hesab və rezervasiya məlumatları yalnız istifadə etdiyiniz brauzerdə saxlanılır. Brauzer məlumatlarını sildikdə bu məlumatlar da silinə bilər.",
      "Göstərilən qiymətlər, boş vaxtlar və məkan məlumatları nümunə xarakterlidir. Real rezervasiya və ödəniş funksiyaları qoşulduqda şərtlər yenilənməlidir.",
    ],
  },
  privacy: {
    title: "Məxfilik",
    paragraphs: [
      "Bu demo ad, e-poçt, telefon, şəhər, seçilmişlər və rezervasiya məlumatlarını brauzerinizin lokal yaddaşında saxlayır.",
      "Daxil etdiyiniz şifrə saxlanmır və serverə göndərilmir. Hazırda həqiqi hesab təsdiqi və şifrə bərpası mövcud deyil.",
      "Eyni brauzerdən istifadə edən digər şəxslər saxlanmış demo məlumatlarını görə bilər. Lokal məlumatları silmək üçün brauzerinizin sayt məlumatlarını təmizləyin.",
    ],
  },
};


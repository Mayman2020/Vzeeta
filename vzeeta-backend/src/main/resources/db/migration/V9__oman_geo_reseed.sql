SET search_path TO vzeeta_mgmt;

-- Platform pivot: replace the Egypt-based city/area seed with Oman's governorates (cities)
-- and wilayats (areas). Demo clinic branches lose their area link (set to NULL) since the
-- old Egyptian areas no longer exist; a real clinic-admin will re-pick a wilayat from the UI.
UPDATE clinic_branches SET area_id = NULL;

DELETE FROM areas;
DELETE FROM cities;

ALTER SEQUENCE cities_id_seq RESTART WITH 1;
ALTER SEQUENCE areas_id_seq RESTART WITH 1;

INSERT INTO cities (id, name_ar, name_en) VALUES
(1,  'مسقط', 'Muscat'),
(2,  'ظفار', 'Dhofar'),
(3,  'مسندم', 'Musandam'),
(4,  'البريمي', 'Al Buraimi'),
(5,  'الداخلية', 'Ad Dakhiliyah'),
(6,  'شمال الباطنة', 'Al Batinah North'),
(7,  'جنوب الباطنة', 'Al Batinah South'),
(8,  'شمال الشرقية', 'Ash Sharqiyah North'),
(9,  'جنوب الشرقية', 'Ash Sharqiyah South'),
(10, 'الظاهرة', 'Adh Dhahirah'),
(11, 'الوسطى', 'Al Wusta');

SELECT setval('cities_id_seq', (SELECT MAX(id) FROM cities));

INSERT INTO areas (city_id, name_ar, name_en) VALUES
-- Muscat
(1, 'مسقط', 'Muscat'),
(1, 'مطرح', 'Muttrah'),
(1, 'بوشر', 'Bawshar'),
(1, 'السيب', 'Seeb'),
(1, 'العامرات', 'Al Amerat'),
(1, 'قريات', 'Qurayyat'),
-- Dhofar
(2, 'صلالة', 'Salalah'),
(2, 'طاقة', 'Taqah'),
(2, 'مرباط', 'Mirbat'),
(2, 'سدح', 'Sadah'),
(2, 'رخيوت', 'Rakhyut'),
(2, 'ضلكوت', 'Dhalkut'),
(2, 'مقشن', 'Muqshin'),
(2, 'ثمريت', 'Thumrait'),
(2, 'المزيونة', 'Al Mazyona'),
(2, 'شليم وجزر الحلانيات', 'Shalim and the Hallaniyat Islands'),
-- Musandam
(3, 'خصب', 'Khasab'),
(3, 'بخا', 'Bukha'),
(3, 'دبا البيعة', 'Daba Al-Bayah'),
(3, 'مدحاء', 'Madha'),
-- Al Buraimi
(4, 'البريمي', 'Al Buraimi'),
(4, 'محضة', 'Mahdah'),
(4, 'السنينة', 'As-Sunaynah'),
-- Ad Dakhiliyah
(5, 'نزوى', 'Nizwa'),
(5, 'بهلاء', 'Bahla'),
(5, 'منح', 'Manah'),
(5, 'الحمراء', 'Al Hamra'),
(5, 'أدم', 'Adam'),
(5, 'إزكي', 'Izki'),
(5, 'سمائل', 'Samail'),
(5, 'بدبد', 'Bidbid'),
-- Al Batinah North
(6, 'صحار', 'Sohar'),
(6, 'شناص', 'Shinas'),
(6, 'لوى', 'Liwa'),
(6, 'صحم', 'Saham'),
(6, 'الخابورة', 'Al Khaburah'),
(6, 'السويق', 'Suwaiq'),
-- Al Batinah South
(7, 'الرستاق', 'Rustaq'),
(7, 'العوابي', 'Awabi'),
(7, 'نخل', 'Nakhal'),
(7, 'ودي المعاول', 'Wadi Al Ma''awil'),
(7, 'المصنعة', 'Al Musanaah'),
(7, 'بركاء', 'Barka'),
-- Ash Sharqiyah North
(8, 'إبراء', 'Ibra'),
(8, 'المضيبي', 'Al Mudhaibi'),
(8, 'بدية', 'Bidiyah'),
(8, 'وادي بني خالد', 'Wadi Bani Khalid'),
(8, 'دماء والطائيين', 'Dima Wa Al Taiyin'),
-- Ash Sharqiyah South
(9, 'صور', 'Sur'),
(9, 'الكامل والوافي', 'Al Kamil Wal Wafi'),
(9, 'جعلان بني بو علي', 'Jaalan Bani Bu Ali'),
(9, 'جعلان بني بو حسن', 'Jaalan Bani Bu Hassan'),
(9, 'مصيرة', 'Masirah'),
-- Adh Dhahirah
(10, 'عبري', 'Ibri'),
(10, 'ينقل', 'Yanqul'),
(10, 'ضنك', 'Dhank'),
-- Al Wusta
(11, 'هيماء', 'Haima'),
(11, 'الدقم', 'Duqm'),
(11, 'محوت', 'Mahout'),
(11, 'الجازر', 'Al Jazir');

SELECT setval('areas_id_seq', (SELECT MAX(id) FROM areas));

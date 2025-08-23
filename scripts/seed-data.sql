-- ELT Arena Development Seed Data - UTF-8 
-- Bu dosya development ortamında sorunsuz çalışması için özel olarak hazırlanmıştır

-- Encoding ayarla
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- Önce admin kullanıcısı ekle (foreign key için gerekli)
INSERT INTO admin_users (username, password_hash, full_name, is_active) VALUES 
('admin', '$2b$12$xVK6cpWMQaOB3tOxEctQiOB1exB/Eal4A73FQN4PsUcpJ4IEyCXdm', 'Admin User', true)
ON CONFLICT (username) DO NOTHING;

-- Grades (Sınıflar) verilerini ekle
INSERT INTO grades (id, title, category, order_index) VALUES
('2', '2. Sınıf', 'İlkokul', 1),
('3', '3. Sınıf', 'İlkokul', 2),
('4', '4. Sınıf', 'İlkokul', 3),
('5', '5. Sınıf', 'Ortaokul', 4),
('6', '6. Sınıf', 'Ortaokul', 5),
('7', '7. Sınıf', 'Ortaokul', 6),
('8', '8. Sınıf', 'Ortaokul', 7),
('9', '9. Sınıf', 'Lise', 8),
('10', '10. Sınıf', 'Lise', 9),
('11', '11. Sınıf', 'Lise', 10),
('12', '12. Sınıf', 'Lise', 11),
('5-yd', '5. Sınıf (Yabancı Dil)', 'Yabancı Dil', 12),
('6-yd', '6. Sınıf (Yabancı Dil)', 'Yabancı Dil', 13),
('evraklar', 'Evraklar', 'Evraklar', 50),
('elt-ekibi', 'ELT Arena Ekibi', 'ELT Arena Ekibi', 60),
('bize-ulasin', 'Bize Ulaşın', 'Bize Ulaşın', 70)
ON CONFLICT (id) DO NOTHING;

-- Units (Üniteler) verilerini ekle - TÜM 146 ÜNİTE
INSERT INTO units (id, grade_id, title, order_index) VALUES
(261, '10', '1. ÜNİTE', 1),
(262, '10', '2. ÜNİTE', 2),
(263, '10', '3. ÜNİTE', 3),
(264, '10', '4. ÜNİTE', 4),
(265, '10', '5. ÜNİTE', 5),
(266, '10', '6. ÜNİTE', 6),
(267, '10', '7. ÜNİTE', 7),
(268, '10', '8. ÜNİTE', 8),
(269, '10', '9. ÜNİTE', 9),
(270, '10', '10. ÜNİTE', 10),
(271, '11', '1. ÜNİTE', 1),
(272, '11', '2. ÜNİTE', 2),
(273, '11', '3. ÜNİTE', 3),
(274, '11', '4. ÜNİTE', 4),
(275, '11', '5. ÜNİTE', 5),
(276, '11', '6. ÜNİTE', 6),
(277, '11', '7. ÜNİTE', 7),
(278, '11', '8. ÜNİTE', 8),
(279, '11', '9. ÜNİTE', 9),
(280, '11', '10. ÜNİTE', 10),
(281, '12', '1. ÜNİTE', 1),
(282, '12', '2. ÜNİTE', 2),
(283, '12', '3. ÜNİTE', 3),
(284, '12', '4. ÜNİTE', 4),
(285, '12', '5. ÜNİTE', 5),
(286, '12', '6. ÜNİTE', 6),
(287, '12', '7. ÜNİTE', 7),
(288, '12', '8. ÜNİTE', 8),
(289, '12', '9. ÜNİTE', 9),
(290, '12', '10. ÜNİTE', 10),
(291, '2', '1. ÜNİTE', 1),
(292, '2', '2. ÜNİTE', 2),
(293, '2', '3. ÜNİTE', 3),
(294, '2', '4. ÜNİTE', 4),
(295, '2', '5. ÜNİTE', 5),
(296, '2', '6. ÜNİTE', 6),
(297, '2', '7. ÜNİTE', 7),
(298, '2', '8. ÜNİTE', 8),
(299, '3', '1. ÜNİTE', 1),
(300, '3', '2. ÜNİTE', 2),
(301, '3', '3. ÜNİTE', 3),
(302, '3', '4. ÜNİTE', 4),
(303, '3', '5. ÜNİTE', 5),
(304, '3', '6. ÜNİTE', 6),
(305, '3', '7. ÜNİTE', 7),
(306, '3', '8. ÜNİTE', 8),
(307, '3', '9. ÜNİTE', 9),
(308, '3', '10. ÜNİTE', 10),
(309, '4', '1. ÜNİTE', 1),
(310, '4', '2. ÜNİTE', 2),
(311, '4', '3. ÜNİTE', 3),
(312, '4', '4. ÜNİTE', 4),
(313, '4', '5. ÜNİTE', 5),
(314, '4', '6. ÜNİTE', 6),
(315, '4', '7. ÜNİTE', 7),
(316, '4', '8. ÜNİTE', 8),
(317, '4', '9. ÜNİTE', 9),
(318, '4', '10. ÜNİTE', 10),
(319, '5', '1. ÜNİTE', 1),
(320, '5', '2. ÜNİTE', 2),
(321, '5', '3. ÜNİTE', 3),
(322, '5', '4. ÜNİTE', 4),
(323, '5', '5. ÜNİTE', 5),
(324, '5', '6. ÜNİTE', 6),
(325, '5', '7. ÜNİTE', 7),
(326, '5', '8. ÜNİTE', 8),
(337, '6', '1. ÜNİTE', 1),
(338, '6', '2. ÜNİTE', 2),
(339, '6', '3. ÜNİTE', 3),
(340, '6', '4. ÜNİTE', 4),
(341, '6', '5. ÜNİTE', 5),
(342, '6', '6. ÜNİTE', 6),
(343, '6', '7. ÜNİTE', 7),
(344, '6', '8. ÜNİTE', 8),
(345, '6', '9. ÜNİTE', 9),
(346, '6', '10. ÜNİTE', 10),
(357, '7', '1. ÜNİTE', 1),
(358, '7', '2. ÜNİTE', 2),
(359, '7', '3. ÜNİTE', 3),
(360, '7', '4. ÜNİTE', 4),
(361, '7', '5. ÜNİTE', 5),
(362, '7', '6. ÜNİTE', 6),
(363, '7', '7. ÜNİTE', 7),
(364, '7', '8. ÜNİTE', 8),
(365, '7', '9. ÜNİTE', 9),
(366, '7', '10. ÜNİTE', 10),
(367, '8', '1. ÜNİTE', 1),
(368, '8', '2. ÜNİTE', 2),
(369, '8', '3. ÜNİTE', 3),
(370, '8', '4. ÜNİTE', 4),
(371, '8', '5. ÜNİTE', 5),
(372, '8', '6. ÜNİTE', 6),
(373, '8', '7. ÜNİTE', 7),
(374, '8', '8. ÜNİTE', 8),
(375, '8', '9. ÜNİTE', 9),
(376, '8', '10. ÜNİTE', 10),
(377, '9', '1. ÜNİTE', 1),
(378, '9', '2. ÜNİTE', 2),
(379, '9', '3. ÜNİTE', 3),
(380, '9', '4. ÜNİTE', 4),
(381, '9', '5. ÜNİTE', 5),
(382, '9', '6. ÜNİTE', 6),
(383, '9', '7. ÜNİTE', 7),
(384, '9', '8. ÜNİTE', 8),
(385, '5-yd', '1. ÜNİTE', 1),
(386, '5-yd', '2. ÜNİTE', 2),
(387, '5-yd', '3. ÜNİTE', 3),
(388, '5-yd', '4. ÜNİTE', 4),
(389, '5-yd', '5. ÜNİTE', 5),
(390, '5-yd', '6. ÜNİTE', 6),
(391, '5-yd', '7. ÜNİTE', 7),
(392, '5-yd', '8. ÜNİTE', 8),
(393, '5-yd', '9. ÜNİTE', 9),
(394, '5-yd', '10. ÜNİTE', 10),
(395, '5-yd', '11. ÜNİTE', 11),
(396, '5-yd', '12. ÜNİTE', 12),
(397, '5-yd', '13. ÜNİTE', 13),
(398, '5-yd', '14. ÜNİTE', 14),
(399, '5-yd', '15. ÜNİTE', 15),
(400, '5-yd', '16. ÜNİTE', 16),
(401, '6-yd', '1. ÜNİTE', 1),
(402, '6-yd', '2. ÜNİTE', 2),
(403, '6-yd', '3. ÜNİTE', 3),
(404, '6-yd', '4. ÜNİTE', 4),
(405, '6-yd', '5. ÜNİTE', 5),
(406, '6-yd', '6. ÜNİTE', 6),
(407, '6-yd', '7. ÜNİTE', 7),
(408, '6-yd', '8. ÜNİTE', 8),
(409, '6-yd', '9. ÜNİTE', 9),
(410, '6-yd', '10. ÜNİTE', 10),
(411, '6-yd', '11. ÜNİTE', 11),
(412, '6-yd', '12. ÜNİTE', 12),
(413, '6-yd', '13. ÜNİTE', 13),
(414, '6-yd', '14. ÜNİTE', 14),
(415, '6-yd', '15. ÜNİTE', 15),
(416, '6-yd', '16. ÜNİTE', 16),
(1000, 'evraklar', 'PLANLAR', 1),
(1001, 'evraklar', 'ZÜMRE TUTANAKLARI', 2),
(1002, 'evraklar', 'ŞDK TUTANAKLARI', 3),
(1003, 'evraklar', 'VELİ TOPLANTI TUTANAKLARI', 4),
(1004, 'evraklar', 'DYK PLANLARI', 5),
(1005, 'evraklar', 'HAZIR BULUNUŞLUK SINAVLARI', 6),
(1006, 'elt-ekibi', 'EKİP ÜYELERİ', 1),
(1007, 'bize-ulasin', 'INSTAGRAM', 1),
(1008, 'bize-ulasin', 'FACEBOOK', 2),
(1009, 'bize-ulasin', 'MAIL', 3)
ON CONFLICT (id) DO NOTHING;

-- Örnek Resources (Materyaller) 8. Sınıf için
INSERT INTO resources (id, unit_id, title, type, description, link, preview_link, download_link, file_url, category, created_by) VALUES
-- 8. Sınıf 1. Ünite örnekleri
('8-1-book-1', 367, 'Introduction to English', 'book-presentation', 'İngilizceye giriş sunumu', NULL, 'https://view.officeapps.live.com/op/view.aspx?src=https://file-examples.com/storage/feb4b7a8ead4c72e6b87b7c/2017/02/file_example_PPTX_250kB.pptx', 'https://file-examples.com/storage/feb4b7a8ead4c72e6b87b7c/2017/02/file_example_PPTX_250kB.pptx', NULL, NULL, 1),
('8-1-game-1', 367, 'Vocabulary Game', 'game', 'Kelime oyunu', 'https://etkinlik.app/web-oyun/index.html?code=nIAuHi7z', NULL, NULL, NULL, 'Fortune Match', 1),
('8-1-game-2', 367, 'Tower Challenge', 'game', 'Kule oyunu', 'https://etkinlik.app/tower-game/index.html?code=dzYIVw81', NULL, NULL, NULL, 'Tower Game', 1),
('8-1-summary-1', 367, 'Unit Summary', 'summary', '1. Ünite özeti', NULL, NULL, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, NULL, 1),
('8-1-quiz-1', 367, 'Unit Quiz', 'quiz', '1. Ünite testi', 'https://forms.google.com/sample', NULL, NULL, NULL, NULL, 1),

-- 8. Sınıf 2. Ünite örnekleri  
('8-2-book-1', 368, 'Daily Routines', 'book-presentation', 'Günlük aktiviteler sunumu', NULL, 'https://view.officeapps.live.com/op/view.aspx?src=https://file-examples.com/storage/feb4b7a8ead4c72e6b87b7c/2017/02/file_example_PPTX_250kB.pptx', NULL, NULL, NULL, 1),
('8-2-worksheet-1', 368, 'Daily Routine Worksheet', 'worksheet', 'Günlük rutinler çalışma kağıdı', NULL, NULL, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, NULL, 1),
('8-2-game-1', 368, 'Word Match', 'game', 'Kelime eşleştirme oyunu', 'https://create.kahoot.it/share/sample-game/12345', NULL, NULL, NULL, 'Kahoot!', 1);

-- Sample team members
INSERT INTO team_members (name, position, bio, email, photo_url) VALUES
('Ahmet Yılmaz', 'Kurucu & İngilizce Öğretmeni', 'İngilizce eğitimi alanında 15+ yıl deneyim', 'ahmet@eltarena.com', NULL),
('Fatma Demir', 'İçerik Editörü', 'Eğitim materyalleri geliştirme uzmanı', 'fatma@eltarena.com', NULL);

-- Sample contact info
INSERT INTO contact_info (title, content, type, icon) VALUES
('Instagram', '@eltarena', 'instagram', '📷'),
('Facebook', 'ELT Arena', 'facebook', '📘'),
('E-posta', 'info@eltarena.com', 'email', '✉️'),
('WhatsApp', '+90 555 123 45 67', 'whatsapp', '📱');

-- Sample documents
INSERT INTO documents (title, description, file_url, file_name, document_type) VALUES
('2024-2025 Yıllık Plan', 'İngilizce dersi yıllık planı', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'yillik-plan-2024-2025.pdf', 'planlar'),
('1. Dönem Zümre Tutanağı', 'Birinci dönem zümre toplantı tutanağı', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'zumre-tutanagi-1-donem.pdf', 'zumre-tutanaklari');

-- Sample announcements
INSERT INTO announcements (title, content, is_active, created_by) VALUES
('Hoş Geldiniz!', 'ELT Arena platformuna hoş geldiniz. Bu geliştirme ortamında tüm özelliklerimizi test edebilirsiniz.', true, 1),
('Test Duyurusu', 'Bu bir test duyurusudur. Development ortamı düzgün çalışıyor.', false, 1);


# أمثلة Register لـ Swagger

24 طلباً مستقلاً: الكويت وقطر والإمارات × 8 أنشطة.
كل ملف Register_*.json هو body كامل لطلب RegisterNewTenantAsync، وليس API route.

## الاستخدام
1. افتح endpoint تسجيل الشركة الفعلي عندك في Swagger واضغط Try it out.
2. انسخ محتوى ملف واحد من KWT أو QAT أو UAE إلى request body.
3. استبدل adminEmail ببريد تملكه ويكون غير مستخدم بحساب آخر حسب سياسة Identity لديك.
4. غيّر اسم الشركة إذا كان مسجلاً سابقاً. كلمة المرور الموجودة مثال للتطوير وليست كلمة مرور إنتاج.
5. نفذ Register، ثم Verify بنفس البريد وغرض EmailConfirmation، ثم Login.
6. إذا كان InitializeSettingsDto الفعلي يتطلب حقولاً إضافية، أكملها حسب Swagger؛ الأمثلة مبنية على الحقول التي عرضتها.

## ملاحظات
- العملات الأساسية: KWD للكويت، QAR لقطر، AED للإمارات، وUSD إضافية في جميع الأمثلة.
- العملة الأساسية موجودة دائماً ضمن selectedCurrencyCodes.
- taxType = null لأن قيمه المعتمدة في مشروعك غير محددة؛ اختيار البلد لا يفعّل الضريبة آلياً في هذه الأمثلة.
- هذه الأمثلة لا تضيف قوالب أو حسابات إلى المشروع بنفسها؛ يجب أن تكون ملفات القوالب متاحة بأسمائها المحددة.
- البريد example.com في الأمثلة لا يستقبل الرمز في بريدك. استبدله ببريد حقيقي للتسليم. في Development فقط يمكن تجربة الرمز 123456 إذا كانت دالة الإرسال قد جهزته وحفظته كما اتفقنا.
- لا ترسل All_Register_Requests.json كله إلى endpoint التسجيل؛ إنه ملف مرجعي يجمع الطلبات مع أسماء القوالب. انسخ request المطلوب فقط أو استخدم أحد الملفات المستقلة.
- لم تُنفّذ أي طلبات على API أو قاعدة البيانات.

## القوالب
| البلد | النشاط | الملف |
|---|---|---|
| kuwait | general | KWT_GeneralTemplate.json |
| kuwait | retail | KWT_RetailTemplate.json |
| kuwait | service | KWT_ServiceTemplate.json |
| kuwait | manufacturing | KWT_ManufacturingTemplate.json |
| kuwait | restaurant | KWT_RestaurantTemplate.json |
| kuwait | clinics | KWT_ClinicsTemplate.json |
| kuwait | hotels | KWT_HotelsTemplate.json |
| kuwait | spa-salon | KWT_SpaSalonTemplate.json |
| qatar | general | QAT_GeneralTemplate.json |
| qatar | retail | QAT_RetailTemplate.json |
| qatar | service | QAT_ServiceTemplate.json |
| qatar | manufacturing | QAT_ManufacturingTemplate.json |
| qatar | restaurant | QAT_RestaurantTemplate.json |
| qatar | clinics | QAT_ClinicsTemplate.json |
| qatar | hotels | QAT_HotelsTemplate.json |
| qatar | spa-salon | QAT_SpaSalonTemplate.json |
| uae | general | UAE_GeneralTemplate.json |
| uae | retail | UAE_RetailTemplate.json |
| uae | service | UAE_ServiceTemplate.json |
| uae | manufacturing | UAE_ManufacturingTemplate.json |
| uae | restaurant | UAE_RestaurantTemplate.json |
| uae | clinics | UAE_ClinicsTemplate.json |
| uae | hotels | UAE_HotelsTemplate.json |
| uae | spa-salon | UAE_SpaSalonTemplate.json |

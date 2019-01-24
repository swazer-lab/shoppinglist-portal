/**
 * Localization file for Arabic - Jordan (ar-JO)
 */
(function (factory) {
    // Module systems magic dance.
    /*global require,ko.validation,define,module*/
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // CommonJS or Node
        module.exports = factory(require('../'));
    } else if (typeof define === 'function' && define['amd']) {
        // AMD anonymous module with hard-coded dependency on 'knockout.validation'
        define(['knockout.validation'], factory);
    } else {
        // <script> tag: use the global `ko.validation` object
        factory(ko.validation);
    }
}(function (kv) {
    if (!kv || typeof kv.defineLocale !== 'function') {
        throw new Error('Knockout-Validation is required, please ensure it is loaded before this localization file');
    }
    return kv.defineLocale('ar-SA', {
        required: 'مطلوب.',
        min: 'أدخل قيمة اكبر من {0}.',
        max: 'أدخل قيمة اقل من {0}.',
        minLength: 'أدخل  {0} احرف أو أكثر.',
        maxLength: 'أدخل {0} أحرف أو أقل.',
        pattern: 'قيمة غير صحيحة.',
        step: 'يجب ان تضاف بمقدار {0}.',
        email: 'صيغة البريد الالكتروني غير صحيحة.',
        date: 'صيغة التاريخ غير صحيحة.',
        dateISO: 'صيغة التاريخ غير صحيحة.',
        number: 'يرجى إدخال رقم.',
        digit: 'يرجى إدخال منزلة.',
        phoneUS: 'صيغة رقم الهاتف غير صحيحة.',
        equal: 'القيمة غير مساوية.', 
        notEqual: 'يرجى اختيار قيمة اخرى.',
        unique: 'يرجى التحقق من عدم اختبار قيمة مشابهة.',
        oneElementAtLeastCheckBoxList: 'يجب أن تختار عيادة واحدة على الأقل',
        oneElementAtLeast: 'يجب إضافة عنصر واحد على الأقل',
        lessThan: 'هذا الحقل يجب أن يكون أصغر من {0}',
        areSame: 'تأكيد كلمة المرور يجب أن يطابق كلمة المرور',
        url: 'يجب أن يكون عنوان صحيح',
        greaterThan: 'هذا الحقل يجب أن يكون أكبر من تاريخ البدء',
        isHolidayValid: 'يجب أن يتم اختيار عطلة أو فترة راحة واحدة على الأقل',
        isPeriodInActive: 'يجب أن يكون هناك فترة واحدة مفعلة على الأقل',
        isAllPeriodsAreValid: 'ساعة البدء يجب أن تكوت قبل ساعة الإنتهاء من أجل جميع الفترات',
        oneLangAtLeast: 'يجب على الأقل اختيار لغة واحدة',
    });
}));
# מדריך שימוש בכלי ניהול התמונות (Admin Tool)

## מטרת הכלי
כלי זה מאפשר לך לשייך תמונות (לוגואים ורקעים) לפרויקטים בצורה ויזואלית ונוחה, ולייצא את הנתונים המעודכנים כ-JSON.

## כיצד להשתמש:

### 1. גישה לכלי
פתח את הדפדפן וגש לכתובת:
```
http://localhost:3000/admin
```

### 2. בחירת פרויקט
בצד שמאל תראה רשימה של כל הפרויקטים. לחץ על הפרויקט שתרצה לערוך.

### 3. שיוך תמונות
עבור כל פרויקט תוכל לבחור:
- **לוגו** - התמונה שתוצג בראש הסקשן
- **רקע דסקטופ** - תמונת הרקע שתוצג במסכים גדולים
- **רקע מובייל (אופציונלי)** - תמונת רקע חלופית למסכים קטנים

### 4. ניווט בין פרויקטים
השתמש בכפתורים "פרויקט קודם" ו"פרויקט הבא" כדי לעבור בין הפרויקטים.

### 5. שמירת השינויים
לאחר שסיימת לשייך את כל התמונות:
1. לחץ על כפתור "📋 העתק JSON מעודכן ללוח"
2. פתח את הקובץ `app/page.tsx`
3. מצא את המשתנה `export const projects: ProjectData[] = [`
4. החלף את כל התוכן של המערך (מהסוגריים המרובעים `[...]`) ב-JSON שהעתקת
5. שמור את הקובץ

## פרויקטים שדורשים תיקון:
הפרויקטים הבאים כרגע משתמשים בלוגואים זמניים או לא נכונים:
- עינב בובליל (Einav Bublil)
- טליה עובדיה (Talia Ovadia)
- kim kassas couture
- יוכי אפוליאון (Yochi Apolyon)
- רומיס (Romis)
- ברברסי (Barbarsi)
- jorden jewelry

## טיפים:
- אם תמונה לא נטענת, היא תוצג כריבוע ריק
- תוכל לראות בתצוגה הנוכחית את התמונות שנבחרו כרגע
- אם לא בטוח איזה לוגו מתאים לפרויקט, בדוק את שם הקובץ או את ה-URL של הפרויקט

## תמונות זמינות:
הכלי טוען אוטומטית את כל התמונות מהתיקיות:
- `public/images/` - לוגואים
- `public/images/bg/` - תמונות רקע

---

**הערה חשובה:** לאחר שמירת השינויים ב-`app/page.tsx`, האתר יתעדכן אוטומטית (Hot Reload).


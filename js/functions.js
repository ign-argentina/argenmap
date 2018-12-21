function deg_to_dms (deg) {
   var d = Math.floor (deg);
   var minfloat = (deg-d)*60;
   var m = Math.floor(minfloat);
   var secfloat = (minfloat-m)*60;
   var s = Math.round(secfloat);
   // After rounding, the seconds might become 60. These two
   // if-tests are not necessary if no rounding is done.
   if (s==60) {
     m++;
     s=0;
   }
   if (m==60) {
     d++;
     m=0;
   }
   
   d += "";
   d = d.padStart(2, '0');
   m += "";
   m = m.padStart(2, '0');
   s += "";
   s = s.padStart(2, '0');
   return ("" + d + "° " + m + "' " + s + "''");
}

function showImageOnError(image) {
	image.onerror = "";
    image.src = "img/noimage.gif";
    return true;
}

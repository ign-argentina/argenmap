function addAnalytics(analytics_ids) {
  analytics_ids.forEach((id) => {
    $.getScript(
      `https://www.googletagmanager.com/gtag/js?id=${id}`,
      function (data, textStatus, jqxhr) {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
        }
        gtag("js", new Date());
        gtag("config", id);
      }
    );
  });
}

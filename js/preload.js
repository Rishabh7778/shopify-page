document.addEventListener("DOMContentLoaded",()=>{const forms=document.querySelectorAll(".ag-form"),skeletonHTML=`
    <div class="form-skeleton">
      <div class="preload-logo-wrapper">
        <a href="https://arcticgrey.com/" target="_parent" rel="nofollow ugc">
          <img class="preload-logo" src="//arcticgrey.com/cdn/shop/files/new-main-logo.png?v=1703061673" alt="Arctic Grey" width="200" height="32">
        </a>
      </div>
      <div class="skeleton-field"></div>
      <div class="skeleton-field"></div>
      <div class="skeleton-field short"></div>
      <div class="skeleton-button"></div>
    </div>
  `;forms.forEach(form=>{form.innerHTML=skeletonHTML});const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target,src=el.dataset.src;if(!src)return;const script=document.createElement("script");script.src=src,script.defer=!0,script.type="text/javascript",script.dataset.role="form",script.dataset.defaultWidth="800px",script.dataset.customVars="hasEmbedFormStyle=1&hasTransparentBg=1";const removeSkeleton=()=>{const sk=el.querySelector(".form-skeleton");sk&&sk.remove()};script.addEventListener("load",()=>{setTimeout(removeSkeleton,1500)}),setTimeout(removeSkeleton,3e3),observer.unobserve(el)})},{threshold:.2});forms.forEach(form=>observer.observe(form))});
//# sourceMappingURL=/cdn/shop/t/87/assets/preload.js.map?v=131592018880109997421763060639

export function viewport(element: HTMLElement) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                element.classList.add('active');
                observer.unobserve(element); // Only animate once
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '0px 0px -50px 0px' // Offset slightly
    });

    observer.observe(element);

    return {
        destroy() {
            observer.disconnect();
        }
    };
}

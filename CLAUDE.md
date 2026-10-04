# Regras do projeto

- Lenis controla o smooth scroll.
- GSAP controla as animações e movimentos.
- ScrollTrigger controla animações vinculadas ao scroll.
- Não usar animações excessivas ou aleatórias (easings principais: `power3.out` e `expo.out`).
- Preservar totalmente a responsividade. Desktop e mobile têm comportamentos próprios (`gsap.matchMedia`).
- Não alterar a identidade visual existente.
- Não modificar os links dos botões de WhatsApp.
- Não remover os projetos demonstrativos.
- Priorizar performance e acessibilidade (`prefers-reduced-motion` respeitado).

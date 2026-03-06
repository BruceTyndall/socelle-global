# Page snapshot

```yaml
- generic [ref=e4]:
  - link "Back to Home" [ref=e5] [cursor=pointer]:
    - /url: /
    - img [ref=e6]
    - generic [ref=e9]: Back to Home
  - generic [ref=e10]:
    - img [ref=e13]
    - heading "Brand Portal" [level=1] [ref=e17]
    - paragraph [ref=e18]: Manage your brand content and submissions
    - generic [ref=e19]:
      - img [ref=e20]
      - paragraph [ref=e22]: Invalid login credentials
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]: Email Address
        - textbox "Email Address" [ref=e26]:
          - /placeholder: brand@naturopathica.com
          - text: test-brand@platform.dev
      - generic [ref=e27]:
        - generic [ref=e28]: Password
        - textbox "Password" [ref=e29]:
          - /placeholder: ••••••••
          - text: TestPass123!
      - link "Forgot Password?" [ref=e31] [cursor=pointer]:
        - /url: /forgot-password
      - button "Access Brand Portal" [ref=e32] [cursor=pointer]
    - paragraph [ref=e34]: Brand portal access for approved brand partners only
```
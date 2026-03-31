# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - img "InvoiceApp" [ref=e5]
    - generic [ref=e6]:
      - generic [ref=e7]:
        - heading "Create account" [level=1] [ref=e8]
        - paragraph [ref=e9]: Start creating professional invoices for free
      - button "Continue with Google" [ref=e10]:
        - img [ref=e11]
        - text: Continue with Google
      - generic [ref=e18]: or
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Name
          - textbox "Name" [ref=e23]:
            - /placeholder: Your name
            - text: Test User
        - generic [ref=e24]:
          - generic [ref=e25]: Email
          - textbox "Email" [ref=e26]:
            - /placeholder: you@email.com
            - text: test@test.com
        - generic [ref=e27]:
          - generic [ref=e28]: Password
          - textbox "Password" [active] [ref=e29]:
            - /placeholder: Minimum 8 characters
            - text: "123"
        - button "Create account" [ref=e30]
      - paragraph [ref=e31]:
        - text: Already have an account?
        - link "Log in" [ref=e32] [cursor=pointer]:
          - /url: /login
  - button "Open Next.js Dev Tools" [ref=e38] [cursor=pointer]:
    - img [ref=e39]
  - alert [ref=e42]
```
# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - img "InvoiceApp" [ref=e5]
    - generic [ref=e6]:
      - generic [ref=e7]:
        - heading "Log in" [level=1] [ref=e8]
        - paragraph [ref=e9]: Access your account
      - button "Continue with Google" [ref=e10]:
        - img [ref=e11]
        - text: Continue with Google
      - generic [ref=e18]: or
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Email
          - textbox "Email" [ref=e23]:
            - /placeholder: you@email.com
        - generic [ref=e24]:
          - generic [ref=e25]: Password
          - textbox "Password" [ref=e26]:
            - /placeholder: Minimum 8 characters
        - button "Log in" [ref=e27]
      - paragraph [ref=e28]:
        - text: Don't have an account?
        - link "Sign up" [ref=e29] [cursor=pointer]:
          - /url: /signup
  - button "Open Next.js Dev Tools" [ref=e35] [cursor=pointer]:
    - img [ref=e36]
  - alert [ref=e39]
```
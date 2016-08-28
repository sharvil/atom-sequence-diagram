# Sequence Diagrams
A simple, textual way to draw sequence diagrams in Atom. Write
out the diagram in any buffer and press `ctrl+s` to see a live
rendering.

![sequence-diagram demo](http://sharvil.nanavati.net/projects/img/sequence-diagram-demo.gif)

## Example
```
# Lines starting with # are comments.
title: Secure food delivery

# We can optionally create aliases for participants so they have
# shorter names.
participant Bob as b

Alice->Bob: Authentication request

# Instead of referring to "Bob" we can use his alias, "b".
note right of b: Thinks about it
Bob->Alice: Authentication response
Alice-->Bob: optional negotiation
Bob-->Alice: negotiation response
note over Alice, Bob: Authentication complete

note left of Alice: Hungry...
Alice->>Bob: Food request
Bob->Bob: Procure food
Bob->>Alice: Food response
note over Alice, Bob: Transaction complete
```

<img src="http://sharvil.nanavati.net/projects/img/sequence-diagram-sample.png" width="398" height="440">

import { logRects } from "../index";

describe("basic", () => {
  it("works", () => {
    const rectangles = [
      { x: 0, y: 0, width: 100, height: 100 }, // light
      { x: 40, y: 40, width: 100, height: 100 }, // heavy
      { x: 80, y: 80, width: 100, height: 100 }, // double
    ];

    expect(logRects(rectangles, { dontLog: true })).toMatchInlineSnapshot(`
      "
      [0, 0]
             ┌────────┐        
             │        │        
             │        │        
             │        │        
             │   ┏━━━━━━━━┓    
             │   ┃    │   ┃    
             │   ┃    │   ┃    
             │   ┃    │   ┃    
             │   ┃   ╔════════╗
             └───┃───║┘   ┃   ║
                 ┃   ║    ┃   ║
                 ┃   ║    ┃   ║
                 ┃   ║    ┃   ║
                 ┗━━━║━━━━┛   ║
                     ║        ║
                     ║        ║
                     ║        ║
                     ╚════════╝
                                [180, 180]"
    `);

    expect(logRects(rectangles, { dontLog: true, sizePerPoint: 20 })).toMatchInlineSnapshot(`
      "
      [0, 0]
             ┌───┐    
             │   │    
             │ ┏━━━┓  
             │ ┃ │ ┃  
             └─┃─╔═══╗
               ┃ ║ ┃ ║
               ┗━║━┛ ║
                 ║   ║
                 ╚═══╝
                       [180, 180]"
    `);

    expect(logRects(rectangles, { dontLog: true, sizePerPoint: 20, showLegend: false })).toMatchInlineSnapshot(`
      "
      ┌───┐    
      │   │    
      │ ┏━━━┓  
      │ ┃ │ ┃  
      └─┃─╔═══╗
        ┃ ║ ┃ ║
        ┗━║━┛ ║
          ║   ║
          ╚═══╝"
    `);

    expect(logRects(rectangles, { dontLog: true, sizePerPoint: 5, showLegend: false })).toMatchInlineSnapshot(`
      "
      ┌──────────────────┐                
      │                  │                
      │                  │                
      │                  │                
      │                  │                
      │                  │                
      │                  │                
      │                  │                
      │       ┏━━━━━━━━━━━━━━━━━━┓        
      │       ┃          │       ┃        
      │       ┃          │       ┃        
      │       ┃          │       ┃        
      │       ┃          │       ┃        
      │       ┃          │       ┃        
      │       ┃          │       ┃        
      │       ┃          │       ┃        
      │       ┃       ╔══════════════════╗
      │       ┃       ║  │       ┃       ║
      │       ┃       ║  │       ┃       ║
      └───────┃───────║──┘       ┃       ║
              ┃       ║          ┃       ║
              ┃       ║          ┃       ║
              ┃       ║          ┃       ║
              ┃       ║          ┃       ║
              ┃       ║          ┃       ║
              ┃       ║          ┃       ║
              ┃       ║          ┃       ║
              ┗━━━━━━━║━━━━━━━━━━┛       ║
                      ║                  ║
                      ║                  ║
                      ║                  ║
                      ║                  ║
                      ║                  ║
                      ║                  ║
                      ║                  ║
                      ╚══════════════════╝"
    `);
  });
});

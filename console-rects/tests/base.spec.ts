import { getRectsLog } from "../index";

describe("basic", () => {
  it("works", () => {
    const rectangles = [
      { x: 0, y: 0, width: 100, height: 100 }, // light
      { x: 40, y: 40, width: 100, height: 100 }, // heavy
      { x: 80, y: 80, width: 100, height: 100 }, // double
    ];

    expect(getRectsLog(rectangles)).toMatchInlineSnapshot(`
      "
      [0, 0]                 Rectangles (3):
      ┏━━━0━━━━┓             0: [ 0,  0, 100, 100]
      ┃   ┌───1────┐         1: [40, 40, 100, 100]
      ┃   │    ┃   │         2: [80, 80, 100, 100]
      ┃   │   ┌╌╌╌2╌╌╌╌┐
      ┗━━━│━━━╎┛   │   ╎
          └───╎────┘   ╎
              ╎        ╎
              └╌╌╌╌╌╌╌╌┘
              [180, 180]"
    `);

    expect(getRectsLog(rectangles, { sizePerPoint: 20 })).toMatchInlineSnapshot(`
      "
      [0, 0]         Rectangles (3):
      ┏━┌─1─┐        0: [ 0,  0, 100, 100]
      ┃ │ ┌╌2╌┐      1: [40, 40, 100, 100]
      ┗━└─╎─┘ ╎      2: [80, 80, 100, 100]
          └╌╌╌┘
      [180, 180]"
    `);

    expect(getRectsLog(rectangles, { sizePerPoint: 20, showLegend: false })).toMatchInlineSnapshot(`
      "
      ┏━┌─1─┐       Rectangles (3):
      ┃ │ ┌╌2╌┐     0: [ 0,  0, 100, 100]
      ┗━└─╎─┘ ╎     1: [40, 40, 100, 100]
          └╌╌╌┘     2: [80, 80, 100, 100]"
    `);

    expect(getRectsLog(rectangles, { sizePerPoint: 5, showLegend: false })).toMatchInlineSnapshot(`
      "
      ┏━━━━━━━━0━━━━━━━━━┓                     Rectangles (3):
      ┃                  ┃                     0: [ 0,  0, 100, 100]
      ┃                  ┃                     1: [40, 40, 100, 100]
      ┃       ┌────────1─────────┐             2: [80, 80, 100, 100]
      ┃       │          ┃       │        
      ┃       │          ┃       │        
      ┃       │       ┌╌╌╌╌╌╌╌╌2╌╌╌╌╌╌╌╌╌┐
      ┃       │       ╎  ┃       │       ╎
      ┗━━━━━━━│━━━━━━━╎━━┛       │       ╎
              │       ╎          │       ╎
              │       ╎          │       ╎
              └───────╎──────────┘       ╎
                      ╎                  ╎
                      ╎                  ╎
                      └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘"
    `);
  });
});

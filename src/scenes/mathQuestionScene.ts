
import Swal from 'sweetalert2';

var createLabel = function (scene, text) {
    return scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x6a4f4b),
  
        text: scene.add.text(0, 0, text, {
            fontSize: '40px'
        }),
  
        space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        }
    });
}
  
var currentQuestion = 0;
type NumberSet = { firstNumber: number; secondNumber: number; correct: boolean; result: number; };

function factors(number) {
    return Array.from(Array(number + 1), function(_, i) { return i }).filter(function(i) { return number % i === 0 });
}

function getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

export function getParameterByName(name: string, url?: string): string|null {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const NUM_COLUMNS = 5;

export default class MathQuestionScene extends Phaser.Scene {
    rexUI: any
    currentCorrectAnswer: number
    constructor() {
        super({
            key: 'MathQuestionScene' + (currentQuestion++)
        });
    }
    create(data) {
        const maxResultSize = (window as any).maxResultSize;
        var operation = (window as any).operation;
        console.log(maxResultSize, operation);
        var correctInitialColumn = getRandomIntInclusive(0, NUM_COLUMNS - 1);
        /* MATH CORE BEGIN */
        var firstFactor, secondFactor, symbol;
        var retrievedQuestion = (window as any).getNextMathQuestion();
        firstFactor = retrievedQuestion.operands[0];
        secondFactor = retrievedQuestion.operands[1];
        symbol = (window as any).mathSymbol;
        this.currentCorrectAnswer = retrievedQuestion.currentCorrectAnswer;
        
        /* MATH CORE END */
        
        var incorrectAnswers: number[] = [];
        for(var i = 0; i < (NUM_COLUMNS-1); i++) {
            var value: number;
            do {
                value = getRandomIntInclusive(0, this.currentCorrectAnswer + 5);
            } while(incorrectAnswers.indexOf(value) != -1 || value == this.currentCorrectAnswer);
            incorrectAnswers.push(value);
        }
        let columns: number[] = [];
        let inputOptions = {};
        for(var i = 0; i < NUM_COLUMNS; i++) {
            columns[i] = i == correctInitialColumn ? this.currentCorrectAnswer : (incorrectAnswers.pop() as number)
            inputOptions[columns[i].toString()] = columns[i].toString();
        }
        
        
        Swal.fire({
            title: `${firstFactor} ${symbol} ${secondFactor} = ?`,
            text: `(${data.num-1} question${(data.num-1) == 1 ? '' : 's'} left to answer after this)`,
            input: 'select',
            inputOptions,

        }).then(obj => {
            this.events.emit("answer_click", { text: (obj as any).value.toString() });
        })
        /*
        var dialog = this.rexUI.add.dialog({
            anchor: {
                centerX: 'center',
                centerY: 'center',
            },
    
            background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x3e2723),
    
            title: this.rexUI.add.label({
                background: this.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x1b0000),
                text: this.add.text(0, 0, `Answer ${data.num} question${data.num == 1 ? '' : 's'} to continue...`, {
                    fontSize: '60px'
                }),
                space: {
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10
                }
            }),
    
            content: this.add.text(0, 0, `${firstFactor} ${symbol} ${secondFactor} = ?`, {
                fontSize: '40px'
            }),
    
            choices: columns.map(val => createLabel(this, val.toString())),

            space: {
                title: 25,
                content: 25,
                choice: 15,
    
                left: 25,
                right: 25,
                top: 25,
                bottom: 25,
            },
    
            expand: {
                content: false,  // Content is a pure text object
            }
        }).layout().popUp(1000);
        dialog.on('button.click', (button) => {
            this.events.emit("answer_click", button);
            dialog.destroy();
        }).on('button.over', function (button, groupName, index) {
            button.getElement('background').setStrokeStyle(1, 0xffffff);
        })
        .on('button.out', function (button, groupName, index) {
            button.getElement('background').setStrokeStyle();
        });
        */
    }
    async getQuestionAnswer(): Promise<boolean> {
        return new Promise(resolve => this.events.once('answer_click', async(button) => {
            let correct = parseInt(button.text) == this.currentCorrectAnswer;
            this.sound.play(`player_answers_${correct ? "correct" : "incorrect"}ly`);
            if(!correct) {
                await new Promise<void>(resolve => {
                    var infoDialog = this.rexUI.add.dialog({
                        anchor: {
                            centerX: 'center',
                            centerY: 'center',
                        },
            
                        background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),
            
                        title: this.rexUI.add.label({
                            background: this.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f),
                            text: this.add.text(0, 0, 'Incorrect', {
                                fontSize: '60px'
                            }),
                            space: {
                                left: 15,
                                right: 15,
                                top: 10,
                                bottom: 10
                            }
                        }),
            
                        content: this.add.text(0, 0, 'The correct answer was ' + this.currentCorrectAnswer + '.', {
                            fontSize: '40px'
                        }),
            
                        actions: [
                            createLabel(this, 'OK'),
                        ],
            
                        space: {
                            title: 25,
                            content: 25,
                            action: 15,
            
                            left: 10,
                            right: 10,
                            top: 10,
                            bottom: 10,
                        },
            
                        align: {
                            actions: 'right', // 'center'|'left'|'right'
                        },
            
                        expand: {
                            content: false, // Content is a pure text object
                        }
                    })
                        .layout()
                        // .drawBounds(this.add.graphics(), 0xff0000)
                        .popUp(1000);
        
                    infoDialog
                        .on('button.click', function (button, groupName, index) {
                            resolve();
                        }, this)
                        .on('button.over', function (button, groupName, index) {
                            button.getElement('background').setStrokeStyle(1, 0xffffff);
                        })
                        .on('button.out', function (button, groupName, index) {
                            button.getElement('background').setStrokeStyle();
                        });
                });
            }
            resolve(correct);
        }));
    }
}